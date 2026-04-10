import express from 'express';
import { jwtCheck } from '../middleware/jwtCheck.js';
import { attachUser } from '../middleware/attachUser.js';
import { requireOrg } from '../middleware/roles.js';
import { getVerifiedOrgs } from '../services/userService.js';
import { getOrgForDashboard } from '../services/userService.js';
import { updateOrg } from '../services/userService.js';
const router = express.Router();

// Get all verified organizations
router.get("/", async (req, res) => {
  try {
    const orgs = await getVerifiedOrgs();
    res.json(orgs);
  } catch (err) {
    console.error("Error fetching orgs:", err);
    res.status(500).json({ error: "Failed to fetch organizations" });
  }
});

// Get single organization 
router.get("/private", jwtCheck, attachUser, requireOrg, async (req, res) => {
  try {
    const userId = req.user.id
    const org = await getOrgForDashboard(userId);
    res.json(org);
  } catch (err) {
    if (err.message === "Org was not found"){
      console.error("Org was not found", err);
      return res.status(404).json({ error: "Organization was not found" });
    }

    console.error("Private org error:", err);
    res.status(500).json({ error: "Failed to fetch organization" });
  }
});

// Update organization profile
router.put("/:id", jwtCheck, attachUser, requireOrg, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; 
  const { name, org_description, website, email } = req.body;
  
  if (id !== userId) {
    return res.status(403).json({ error: "Unauthorized"})
  }

  try {
    const org = await updateOrg(id, {name, org_description, website, email})
    res.json(org);
  } catch (err) {
    console.error("Error updating organization:", err);
    res.status(500).json({ error: "Failed to update organization" });
  }
});

export default router;