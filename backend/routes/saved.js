import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// Get all saved opportunities for a user
router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const { data, error } = await supabase
      .from("saved_opportunities")
      .select(`
        id,
        opportunity_id,
        opportunities (
          id,
          title,
          description,
          gpa_requirement,
          apply_link,
          majors
        )
      `)
      .eq("user_id", user_id);

    if (error) throw error;

    const formatted = data.map((s) => s.opportunities);
    res.json(formatted);
  } catch (err) {
    console.error("Error fetching saved opportunities:", err);
    res.status(500).json({ error: "Failed to fetch saved opportunities" });
  }
});

// Save an opportunity
router.post("/", async (req, res) => {
  try {
    const { user_id, opportunity_id } = req.body;

    if (!user_id || !opportunity_id) {
      return res.status(400).json({ error: "Missing user_id or opportunity_id" });
    }

    const { data, error } = await supabase
      .from("saved_opportunities")
      .upsert([{ user_id, opportunity_id }])
      .select();

    if (error) throw error;
    res.json({ message: "Saved successfully", data });
  } catch (err) {
    console.error("Error saving opportunity:", err);
    res.status(500).json({ error: "Failed to save opportunity" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("saved_opportunities").delete().eq("id", id);
    if (error) throw error;
    res.json({ message: "Removed from saved" });
  } catch (err) {
    console.error("Error unsaving opportunity:", err);
    res.status(500).json({ error: "Failed to unsave opportunity" });
  }
});

export default router;
