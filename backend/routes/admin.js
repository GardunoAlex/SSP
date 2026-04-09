import express from "express";
import { getOrgs } from "../services/userService.js";
import { getStudents } from "../services/userService.js";
import { getOpportunities } from "../services/userService.js";
import { modifyOrgVerification } from "../services/userService.js";
import { orgCheck } from "../services/userService.js";
import { deleteOrg } from "../services/userService.js";
import { oppSoftDelete } from "../services/userService.js";
import { oppDelete } from "../services/userService.js";

const router = express.Router();

/**
 * I think this was originally meant for orgs, but it fetches all users.
 * Need to double check where this is being called and what it's being used for
 * 
 */
router.get("/users", async (req, res) => {
  try {
    const orgs = await getOrgs();
    res.json(orgs);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch orgs" });
  }
});

// fetch all students
router.get("/students", async (req, res) => {
  try {
    const students = await getStudents();
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// fetch all opportunities
router.get("/opportunities", async (req, res) => {
  try {
    const opportunities = await getOpportunities();
    res.json(opportunities);
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

    const data = await modifyOrgVerification(id, status);

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Org not found" });
    }

    res.json({ message: "Verification status updated", data });
  } catch (err) {
    console.error("Error updating verification status:", err);
    res.status(500).json({ error: "Failed to update verification status" });
  }
});

// Remove organization (and all related data via cascade)
router.delete("/organization/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Verify the user is actually an org before deleting
    const org = await orgCheck(id);

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    await deleteOrg(id);

    res.json({ message: "Organization removed successfully" });
  } catch (err) {
    console.error("Error removing organization:", err);
    res.status(500).json({ error: "Failed to remove organization" });
  }
});

//soft delete opportunity
router.patch("/opportunity/:id/close", async (req, res) => {
  const { id } = req.params;
  try {
    await oppSoftDelete(id);
    res.json({ message: "Opportunity closed ✅" });
  } catch (err) {

    if (err.message === "Opportunity not found") {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    console.error("Error closing opportunity:", err);
    res.status(500).json({ error: "Failed to close opportunity" });
  }
});

//delete opportunity frfr
router.delete("/opportunity/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await oppDelete(id);
    res.json({ message: "Opportunity removed successfully" });
  } catch (err) {
    if (err.message === "Opportunity not found") {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    console.error("Error removing opportunity:", err);
    res.status(500).json({ error: "Failed to remove opportunity" });
  }
});


export default router;
