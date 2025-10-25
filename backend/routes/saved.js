import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// ✅ Get all saved opportunities for a user
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from("saved_opportunities")
      .select(`
        id,
        opportunity_id,
        opportunities (*)
      `)
      .eq("user_id", user_id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error fetching saved opportunities:", err);
    res.status(500).json({ error: "Failed to fetch saved opportunities" });
  }
});

// ✅ Save an opportunity
router.post("/", async (req, res) => {
  try {
    const { user_id, opportunity_id } = req.body;

    const { data, error } = await supabase
      .from("saved_opportunities")
      .insert([{ user_id, opportunity_id }])
      .select();

    if (error) throw error;
    res.json({ message: "Opportunity saved!", data });
  } catch (err) {
    console.error("Error saving opportunity:", err);
    res.status(500).json({ error: "Failed to save opportunity" });
  }
});

// ✅ Remove a saved opportunity
router.delete("/", async (req, res) => {
  try {
    const { user_id, opportunity_id } = req.body;

    const { error } = await supabase
      .from("saved_opportunities")
      .delete()
      .eq("user_id", user_id)
      .eq("opportunity_id", opportunity_id);

    if (error) throw error;
    res.json({ message: "Opportunity removed from saved list" });
  } catch (err) {
    console.error("Error unsaving opportunity:", err);
    res.status(500).json({ error: "Failed to remove saved opportunity" });
  }
});

export default router;
