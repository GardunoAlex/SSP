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

    // ✅ Fetch user info from Auth0 Management API
    const userRes = await fetch("https://dev-hdl1kw87a8apz4ni.us.auth0.com/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await userRes.json();

    // 🧩 Determine role
    // If your Auth0 rules or app_metadata contains role info, check it here.
    const role = user["https://studentstarter.com/role"] || "student"; 
    // ^ this assumes you’ll add a custom claim (explained below)

    const { data, error } = await supabase
      .from("users")
      .upsert({
        auth_id: user.sub,
        email: user.email,
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

    console.log(`✅ Synced user: ${user.email} (${role})`);
    res.json({ message: "User synced ✅", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to sync user" });
  }
});


export default router;
