import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// Get all verified organizations
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, org_description, website, verified")
      .eq("role", "org")
      .eq("verified", true);

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

// Get single organization by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, org_description, website, verified")
      .eq("id", id)
      .eq("role", "org")
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error fetching org:", err);
    res.status(500).json({ error: "Failed to fetch organization" });
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