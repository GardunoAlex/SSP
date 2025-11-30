import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();


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

export default router;