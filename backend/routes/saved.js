import express from "express";
import { getSavedOpportunities, saveOpportunity, deleteSavedOpportunity } from "../services/userService.js";
const router = express.Router();

// Get all saved opportunities for a user
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const opportunities = await getSavedOpportunities(userId)

    res.json(opportunities);
  } catch (err) {
    console.error("Error fetching saved opportunities:", err);
    res.status(500).json({ error: "Failed to fetch saved opportunities" });
  }
});

// Save an opportunity
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { opportunity_id } = req.body;

    if (!opportunity_id) {
      return res.status(400).json({ error: "Missing opportunity_id" });
    }

    const opportunity = await saveOpportunity(userId, opportunity_id);
    res.json({ message: "Saved successfully", opportunity });
  } catch (err) {
    console.error("Error saving opportunity:", err);
    res.status(500).json({ error: "Failed to save opportunity" });
  }
});

router.delete("/", async (req, res) => {
  try {
    const { opportunity_id } = req.body;
    const userId = req.user.id;

    if (!opportunity_id) {
      return res.status(400).json({ error: "Missing opportunity_id" });
    }

    await deleteSavedOpportunity(userId, opportunity_id);
    res.json({ message: "Unsave successful" });
  } catch (err) {
    console.error("Error unsaving:", err);
    res.status(500).json({ error: "Failed to unsave" });
  }
});


export default router;
