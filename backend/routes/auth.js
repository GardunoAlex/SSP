import express from "express";
import supabase from "../supabaseClient.js";
import fetch from "node-fetch";

const router = express.Router();

// In-memory lock to prevent race conditions
const syncLocks = new Map();

router.post("/sync", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Always fetch from userinfo to get complete user data
    let user;
    const userRes = await fetch("https://dev-hdl1kw87a8apz4ni.us.auth0.com/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!userRes.ok) {
      try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
        user = decoded;
      } catch (err) {
        const text = await userRes.text();
        console.error('Auth0 userinfo fetch failed:', text);
        return res.status(401).json({ error: 'Failed to fetch user info from Auth0' });
      }
    } else {
      user = await userRes.json();
    }

    if (!user.sub) {
      console.error('Auth0 userinfo has no sub:', user);
      return res.status(400).json({ error: 'Auth0 user missing sub' });
    }

    const role = user["https://studentstarter.com/role"] || "student";

    // 🔒 Check if sync is already in progress for this user
    if (syncLocks.has(user.sub)) {
      // Wait for the ongoing sync to complete
      await syncLocks.get(user.sub);
      
      // Fetch the user that was just created
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", user.sub)
        .single();
      
      return res.json({ message: "User synced ✅", data: userData });
    }

    // 🔒 Create a lock for this user
    let resolveLock;
    const lockPromise = new Promise(resolve => { resolveLock = resolve; });
    syncLocks.set(user.sub, lockPromise);

    console.debug('AUTH SYNC: Checking user', { sub: user.sub, role: role });

    try {
      // Check if user exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", user.sub)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking for existing user:", checkError);
        return res.status(500).json({ message: "Database error checking user", error: checkError });
      }

      let userData;

      if (existingUser) {
        // Prevent role conflicts — same Auth0 account can't be both student and org
        if (existingUser.role !== role) {
          return res.status(409).json({
            error: "role_conflict",
            message: `This email is already registered as a ${existingUser.role}. Please use a different email to sign up as ${role === "org" ? "an organization" : "a student"}.`,
          });
        }
        userData = existingUser;
      } else {
        const insertData = {
          auth_id: user.sub,
          email: "N/A",
          name: "N/A",
          role: role,
        };

        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert(insertData)
          .select()
          .single();

        if (insertError) {
          console.error("❌ Insert failed:", insertError);
          return res.status(500).json({ message: "User insert failed", error: insertError });
        }
        userData = newUser;
      }

      res.json({ message: "User synced ✅", data: userData });
    } finally {
      // 🔓 Release the lock
      resolveLock();
      syncLocks.delete(user.sub);
    }

  } catch (err) {
    console.error("💥 Sync error:", err);
    res.status(500).json({ error: "Failed to sync user", details: err.message });
  }
});

export default router;