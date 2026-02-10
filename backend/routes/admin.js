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
    const { status } = req.body;

    const allowed = ["not_verified", "in_progress", "verified"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${allowed.join(", ")}` });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ verified: status })
      .eq("id", id)
      .select();

    if (error) throw error;
    res.json({ message: "Verification status updated", data });
  } catch (err) {
    console.error("Error updating verification status:", err);
    res.status(500).json({ error: "Failed to update verification status" });
  }
});

// ✅ Remove organization (and all related data via cascade)
router.delete("/organization/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Verify the user is actually an org before deleting
    const { data: org, error: lookupError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", id)
      .eq("role", "org")
      .single();

    if (lookupError || !org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.json({ message: "Organization removed successfully" });
  } catch (err) {
    console.error("Error removing organization:", err);
    res.status(500).json({ error: "Failed to remove organization" });
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

// ✅ Remove opportunity
router.delete("/opportunity/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from("opportunities")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.json({ message: "Opportunity removed successfully" });
  } catch (err) {
    console.error("Error removing opportunity:", err);
    res.status(500).json({ error: "Failed to remove opportunity" });
  }
});

export default router;
