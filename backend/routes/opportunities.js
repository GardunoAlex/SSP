import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// get all opportunities

router.get("/", async (req, res) => {
    try{
        const {data, error} = await supabase
        .from("opportunities")
        .select("*")
        .eq("status", "active");

        if (error) throw error; 
        res.json(data);
    } catch (err) {
        console.error("Error Fetching Opportunities: ", err)
        res.status(500).json({error: "Failed to Fetch Opportunities"});

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


// post, create opportunity

router.post("/", async (req, res) => {
    try{
        const {title, description, gpa_requirement, link, majors, org_id} = req.body;
        const {data, error} = await supabase
        .from("opportunities")
        .insert([{title, description, gpa_requirement, link, majors, org_id}])
        .select();
        
        if (error) throw error;

        res.json({ message: "Opportunity Created: ", data});
    } catch (err) {
        console.error("Error Creating Opportunity: ", err);
        res.status(500).json({error: "Failed to Create Opportunity"});
    }
})

// "patch" update opportunities
router.patch("/:id", async (req, res) => {
    try{
        const { id } = req.params;
        const updates = req.body;

        const {data, error} = await supabase
        .from("opportunities")
        .update(updates)
        .eq("id", id)
        .select();

        if (error) throw error;
        res.json( { message: "Opportuntiy Edited: ", data})
    } catch (err) {
        console.error("Error Updating Community: ", err)
        res.status(500).json({ error: "Failed to Update Opportunity"})
    }
}) 

//delete opportunity
router.delete("/:id", async (req,res) => {
    try{
        const { id } = req.params;
        const { data, error } = await supabase
        .from("opportunities")
        .delete()
        .eq("id", id)

        if (error) throw error;

        res.json({ message: "Opportunity Deleted"})
    } catch (err) {
        console.error("Error Deleting Opportunity: ", err);
        res.status(500).json({ error: "Failed to Delete Opportunity"});
    }
});

export default router; 