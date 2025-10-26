import express from "express";
import supabase from "../supabaseClient.js";
import fetch from "node-fetch";

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

// 🟣 GET all org opportunities
router.get("/opportunities", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const orgId = await getSupabaseOrgId(token);

    const { data, error } = await supabase
      .from("opportunities")
      .select("*")
      .eq("org_id", orgId);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error fetching org opportunities:", err);
    res.status(500).json({ error: err.message || "Failed to fetch opportunities" });
  }
});

// 🟢 POST new opportunity
router.post("/opportunities", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const orgId = await getSupabaseOrgId(token);
    const { title, description, gpa_requirement, link, majors } = req.body;

    const formattedMajors =
    typeof majors === "string"
      ? majors.split(",").map((m) => m.trim())
      : majors;
    const { data, error } = await supabase
    .from("opportunities")
    .insert([
      {
        title,
        description,
        gpa_requirement,
        apply_link: link,
        majors: formattedMajors, // ✅ now a proper array
        org_id: orgId,
      },
    ])
    .select();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error creating opportunity:", err);
    res.status(500).json({ error: err.message || "Failed to create opportunity" });
  }
});

// 🔴 DELETE an opportunity
router.delete("/opportunities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
    .from("opportunities")
    .update({ status: "closed" })
    .eq("id", id);
    if (error) throw error;
    res.json({ message: "Opportunity deleted" });
  } catch (err) {
    console.error("Error deleting opportunity:", err);
    res.status(500).json({ error: "Failed to delete opportunity" });
  }
});

export default router;
