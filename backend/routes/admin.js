import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// ✅ Get all users
router.get("/users", async (req, res) => {
  try {
    const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "org");;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ✅ Get all opportunities
router.get("/opportunities", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("opportunities")
      .select("*, users(name, email, role)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error fetching opportunities:", err);
    res.status(500).json({ error: "Failed to fetch opportunities" });
  }
});

router.patch("/verify/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Update the user's verified status
    const { data, error } = await supabase
      .from("users")
      .update({ verified: true })
      .eq("id", id)
      .select();

    if (error) throw error;
    res.json({ message: "User verified successfully", data });
  } catch (err) {
    console.error("Error verifying user:", err);
    res.status(500).json({ error: "Failed to verify user" });
  }
});

// ✅ Close opportunity (soft delete)
router.patch("/opportunity/:id/close", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const { error } = await supabase
      .from("opportunities")
      .update({ status: "closed" })
      .eq("id", id);
    if (error) throw error;
    res.json({ message: "Opportunity closed ✅" });
  } catch (err) {
    console.error("Error closing opportunity:", err);
    res.status(500).json({ error: "Failed to close opportunity" });
  }
});

export default router;
