import express from "express";
import { jwtCheck } from "../middleware/jwtCheck.js";
import { attachUser } from "../middleware/attachUser.js";
import { requireOrg } from "../middleware/roles.js";
import { getPublicOpportunities } from "../services/userService.js";
import { getOrgOpportunities } from "../services/userService.js";
import { getOpportunity } from "../services/userService.js";
import { createOpportunity } from "../services/userService.js";
import { updateOpportunity } from "../services/userService.js";
import { deleteOpportunity } from "../services/userService.js";

const router = express.Router();

// Get all opportunities verified opportunities
router.get("/", async (req, res) => {
  try {
    const opportunities = await getPublicOpportunities();
    res.json(opportunities);
  } catch (err) {
    console.error("Error Fetching Opportunities: ", err);
    res.status(500).json({ error: "Failed to Fetch Opportunities" });
  }
});

// Get opportunities by org_id
router.get("/org/:org_id", async (req, res) => {
  try {
    const { org_id } = req.params;
    const opportunities = await getOrgOpportunities(org_id)
    res.json(opportunities);
  } catch (err) {
    console.error("Error fetching org opportunities:", err);
    res.status(500).json({ error: "Failed to fetch org opportunities" });
  }
});

// Get a single opportunity by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const opportunity = await getOpportunity(id);
    res.json(opportunity);
  } catch (err) {
    if (err.message === "Opportunity not found") {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    console.error("Error fetching opportunity:", err);
    res.status(500).json({ error: "Failed to fetch opportunity" });
  }
});

// Create opportunity : this is the real API
router.post("/", jwtCheck, attachUser, requireOrg, async (req, res) => {
  try {
    const org_id = req.user.id;

    const { 
      title, 
      description, 
      gpa_requirement, 
      apply_link,        // Changed from "link"
      majors, 
      location,          // Added
      deadline,          // Added
      compensation       // Added
    } = req.body;

    const opportunity = await createOpportunity(org_id, { title, description, gpa_requirement, apply_link, majors, location, deadline, compensation })
    res.status(201).json(opportunity);      // Return just the data, not wrapped in message
  } catch (err) {
    console.error("Error Creating Opportunity: ", err);
    res.status(500).json({ error: "Failed to Create Opportunity" });
  }
});

// Update opportunity (changed from PATCH to PUT)
router.put("/:id", jwtCheck, attachUser, requireOrg, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      gpa_requirement, 
      apply_link,     
      majors,
      location,         
      deadline,          
      compensation       
    } = req.body;

    const opportunity = await updateOpportunity(id, {title, description, gpa_requirement, apply_link, majors, location, deadline, compensation});      // Return single object

    res.json(opportunity); 
  } catch (err) {

    if (err.message === "Opportunity not found") {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    console.error("Error Updating Opportunity: ", err);
    res.status(500).json({ error: "Failed to Update Opportunity" });
  }
});

//delete opportunity
router.delete("/:id", jwtCheck, attachUser, requireOrg, async (req, res) => {
  try {
    const { id } = req.params;
    const org_id = req.user.id;
    await deleteOpportunity(id, org_id);
    res.json({ message: "Opportunity Deleted" });
  } catch (err) {
    if (err.message === "Opportunity not found or unauthorized") {
      return res.status(404).json({ error: "Opportunity not found or unauthorized" });
    }
    console.error("Error Deleting Opportunity: ", err);
    res.status(500).json({ error: "Failed to Delete Opportunity" });
  }
});

export default router;