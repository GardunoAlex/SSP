import express from 'express';
import supabase from '../supabaseClient.js';
import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";
const router = express.Router();

const jwks = jwksRsa({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

const getKey = (header, cb) => {
  jwks.getSigningKey(header.kid, (err, key) => {
    cb(err, key?.getPublicKey());
  });
};

// Get all verified organizations
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, org_description, website, verified, banner_url")
      .eq("role", "org")
      .eq("verified", "verified"); 

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error fetching orgs:", err);
    res.status(500).json({ error: "Failed to fetch organizations" });
  }
});

// Get organization by user_id (for dashboard)
router.get("/user/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const { data, error } = await supabase
      .from("users")  // Changed from "organizations" to "users"
      .select("*")
      .eq("id", user_id)
      .eq("role", "org");

    if (error) throw error;
    res.json(data);  // Returns array
  } catch (err) {
    console.error("Error fetching organization by user:", err);
    res.status(500).json({ error: "Failed to fetch organization" });
  }
});

// Get single organization 
router.get("/private", async (req, res) => {
  try {
    /* ---------- AUTHENTICATION ---------- */
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Missing token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(
        token,
        getKey,
        {
          audience: process.env.AUTH0_AUDIENCE,
          issuer: `https://${process.env.AUTH0_DOMAIN}/`,
          algorithms: ["RS256"],
        },
        (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        }
      );
    });

    /* ---------- MAP TO SUPABASE USER ---------- */
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", decoded.sub)
      .single();

    if (userError || !user) {
      return res.status(403).json({ error: "User not registered" });
    }

    /* ---------- AUTHORIZATION ---------- */
    if (user.role !== "org" || !user.id) {
      return res.status(403).json({ error: "Org access required" });
    }

    /* ---------- FETCH ORG ---------- */
    const { data: org, error: orgError } = await supabase
      .from("users")
      .select("id, name, email, org_description, website, verified, banner_url")
      .eq("id", user.id)
      .single();

    if (orgError) {
      return res.status(500).json({ error: "Failed to fetch organization" });
    }

    res.json(org);
  } catch (err) {
    console.error("Private org error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
});

// Update organization profile
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, org_description, website, email } = req.body;
  
  try {
    const { data, error } = await supabase
      .from("users")  
      .update({ name, org_description, website, email })
      .eq("id", id)
      .eq("role", "org")  // Added safety check
      .select()
      .maybeSingle();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error updating organization:", err);
    res.status(500).json({ error: "Failed to update organization" });
  }
});

export default router;