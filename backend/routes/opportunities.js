import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// Helper: Get the Supabase org ID from Auth0 token
async function getSupabaseOrgId(token) {
  // 1️⃣ Get user info from Auth0
  const userRes = await fetch("https://dev-hdl1kw87a8apz4ni.us.auth0.com/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const user = await userRes.json();

  // 2️⃣ Find matching user in Supabase
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.sub)
    .maybeSingle();

  if (error || !data) throw new Error("Supabase org not found");
  return data.id;
}

// Get all opportunities
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("opportunities")
      .select("*")
      .eq("status", "active");

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error Fetching Opportunities: ", err);
    res.status(500).json({ error: "Failed to Fetch Opportunities" });
  }
});

// Get opportunities by org_id
router.get("/org/:org_id", async (req, res) => {
  try {
    const { org_id } = req.params;
    const { data, error } = await supabase
      .from("opportunities")
      .select("*")
      .eq("org_id", org_id)
      .eq("status", "active");

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error fetching org opportunities:", err);
    res.status(500).json({ error: "Failed to fetch opportunities" });
  }
});

// Get a single opportunity by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("opportunities")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error fetching opportunity:", err);
    res.status(500).json({ error: "Failed to fetch opportunity" });
  }
});

// Create opportunity : this is the real API
router.post("/", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Missing auth token" });

    const org_id = await getSupabaseOrgId(token);

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

    const { data, error } = await supabase
      .from("opportunities")
      .insert([{ 
        title, 
        description, 
        gpa_requirement, 
        apply_link,      // Changed from "link"
        majors, 
        org_id,
        location,        // Added
        deadline,        // Added
        compensation,    // Added
        status: "active" // Set default status
      }])
      .select()
      .single();         // Changed to return single object

    if (error) throw error;
    res.json(data);      // Return just the data, not wrapped in message
  } catch (err) {
    console.error("Error Creating Opportunity: ", err);
    res.status(500).json({ error: "Failed to Create Opportunity" });
  }
});

// Update opportunity (changed from PATCH to PUT)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
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

    const { data, error } = await supabase
      .from("opportunities")
      .update({ 
        title, 
        description, 
        gpa_requirement, 
        apply_link,      // Changed from "link"
        majors,
        location,        // Added
        deadline,        // Added
        compensation     // Added
      })
      .eq("id", id)
      .select()
      .single();         // Return single object

    if (error) throw error;
    res.json(data);      // Return just the data
  } catch (err) {
    console.error("Error Updating Opportunity: ", err);
    res.status(500).json({ error: "Failed to Update Opportunity" });
  }
});

//delete opportunity
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("opportunities")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.json({ message: "Opportunity Deleted" });
  } catch (err) {
    console.error("Error Deleting Opportunity: ", err);
    res.status(500).json({ error: "Failed to Delete Opportunity" });
  }
});

export default router;