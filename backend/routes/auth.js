import express from "express";
import supabase from "../supabaseClient.js";
import fetch from "node-fetch";

const router = express.Router();

router.post("/sync", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Try to decode sub + claims from JWT token first to avoid userinfo and rate limits
    let user;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
      user = decoded;
      // Auth0 returns claims like https://studentstarter.com/role; the claim will still show
    } catch (err) {
      // if token not a JWT, fall back to userinfo call
      const userRes = await fetch("https://dev-hdl1kw87a8apz4ni.us.auth0.com/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!userRes.ok) {
        const text = await userRes.text();
        console.error('Auth0 userinfo fetch failed:', text);
        return res.status(401).json({ error: 'Failed to fetch user info from Auth0' });
      }
      user = await userRes.json();
    }

    // 🧩 Determine role
    // If your Auth0 rules or app_metadata contains role info, check it here.
    const role = user["https://studentstarter.com/role"] || "student"; 
    // Validate we have an id
    if (!user.sub) {
      console.error('Auth0 userinfo has no sub:', user);
      return res.status(400).json({ error: 'Auth0 user missing sub' });
    }
    // ^ this assumes you’ll add a custom claim (explained below)

    // ensure we have a fallback email to satisfy NOT NULL constraint
    const fallbackEmail = user.email || (user.name ? `${user.name}@auth0.local` : `${user.sub}@auth0.local`);
    console.debug('AUTH SYNC: user', user);
    console.debug('AUTH SYNC: fallbackEmail', fallbackEmail);
    const { data, error } = await supabase
      .from("users")
      .upsert({
        auth_id: user.sub,
        email: fallbackEmail,
        name: user.name || "",
        role,
      },
        { onConflict: "auth_id" }
      )
      .select();

    if (error) {
      console.error("error in AUTH",error);
      return res.status(400).json({ message: "Upsert failed", error });
    }

    console.log(`✅ Synced user: ${user.email} (${role})`, { upsertResult: data });
    res.json({ message: "User synced ✅", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to sync user" });
  }
});


export default router;
