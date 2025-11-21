import express from 'express';
import supabase from '../supabaseClient.js';
import fetch from 'node-fetch';

const router = express.Router();

// Helper: Get the Supabase org ID from Auth0 token
async function getSupabaseStudentId(token) {
  // 1️⃣ Get user info from Auth0
  const userRes = await fetch("https://dev-hdl1kw87a8apz4ni.us.auth0.com/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });

  //  have to check if the user check was successful or not. 
  if(!userRes.ok){
    throw new Error("Supabase student not found");
  }
  const user = await userRes.json();

  // 2️⃣ Find matching user in Supabase
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.sub)
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
          console.log(key);
          if (updates[key] === ""){
            delete updates[key];
          }
        }

        console.log(updates);
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