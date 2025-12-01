import express from 'express';
import supabase from '../supabaseClient.js';
import fetch from 'node-fetch';

const router = express.Router();

// Helper: Get the Supabase org ID from Auth0 token
async function getSupabaseStudentId(token) {
  // Try to decode sub from token first (avoid rate-limited userinfo calls)
  let sub = null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    sub = decoded?.sub;
  } catch (err) {
    // Not a JWT, will fall back to userinfo
  }

  let user;
  if (!sub) {
    // 1️⃣ Fall back to userinfo if sub not available in token
    const userRes = await fetch("https://dev-hdl1kw87a8apz4ni.us.auth0.com/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!userRes.ok) {
      const text = await userRes.text();
      throw new Error(`Failed to fetch Auth0 userinfo: ${text}`);
    }
    user = await userRes.json();
    sub = user?.sub;
  }

  // 2️⃣ Find matching user in Supabase
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", sub)
    .maybeSingle();

  if (error || !data) throw new Error("Supabase student not found");
  return data.id;
}

// get all of the student info
router.get("/", async(req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const studentId = await getSupabaseStudentId(token);

        const {data,error} = await supabase
        .from('users')
        .select('*')
        .eq('id', studentId);

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error("Error fetching student:", err);
        res.status(500).json({ error: err.message || "Failed to fetch student" });
    }
});

router.patch("/", async(req, res) => {
    try{
        const token = req.headers.authorization?.split(" ")[1];
        const studentId = await getSupabaseStudentId(token); 

        
        const updates = req.body;

        for (let key in updates) {
          if (updates[key] === ""){
            delete updates[key];
          }
        }
        const {data, error} = await supabase
        .from('users')
        .update(updates)
        .eq('id', studentId)
        .select();
 
        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update student" });
    }
});

export default router;