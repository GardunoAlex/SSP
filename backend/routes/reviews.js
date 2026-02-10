import express from "express";
import supabase from "../supabaseClient.js";
import fetch from "node-fetch";
import { auth } from "express-oauth2-jwt-bearer";

const router = express.Router();


const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});


// Get all reviews for an organization (across all its opportunities)
// Must be defined before /:id to avoid "org" being matched as an id
router.get("/org/:orgId", async (req, res) => {
  const { orgId } = req.params;
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, opportunities!inner(org_id, title)")
      .eq("opportunities.org_id", orgId);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error fetching org reviews:", err);
    res.status(500).json({ error: "Failed to fetch organization reviews" });
  }
});

// get the opportunity reviews
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const {data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("opportunity_id", id);

        if (error) throw error;
        console.log("succesfully fetched reviews");
        res.json(data);
    } catch (err) {
        console.log("reviews fetch was unsuccessful", err);
        res.status(500).json({error: "Failed to Fetch Reviews"});
    }
})

router.post("/:id", jwtCheck, async (req, res) => {
  const { id } = req.params;
  const { title, review, rating } = req.body;

  try {
    const auth0Sub = req.auth.payload.sub;

    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("id, role")
      .eq("auth_id", auth0Sub)
      .single();

    if (userErr || !user) {
      return res.status(400).json({ error: "User not found in database" });
    }

    if (user.role === "org") {
      return res.status(403).json({ error: "Organizations cannot write reviews" });
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          opportunity_id: id,
          student_id: user.id,
          title,
          review,
          rating,
        }
      ])
      .select();

    if (error) throw error;

    res.json({ message: "Review Created", data });

  } catch (err) {
    console.error("Error Creating Review:", err);
    res.status(500).json({ error: "Failed to Create Review" });
  }
});

// Org replies to a review on their own opportunity
router.patch("/:reviewId/reply", jwtCheck, async (req, res) => {
  const { reviewId } = req.params;
  const { org_reply } = req.body;

  try {
    const auth0Sub = req.auth.payload.sub;

    // Get the caller's Supabase user
    const { data: caller, error: callerErr } = await supabase
      .from("users")
      .select("id, role")
      .eq("auth_id", auth0Sub)
      .single();

    if (callerErr || !caller) {
      return res.status(400).json({ error: "User not found" });
    }

    if (caller.role !== "org") {
      return res.status(403).json({ error: "Only organizations can reply to reviews" });
    }

    // Verify this review belongs to one of the caller's opportunities
    const { data: review, error: reviewErr } = await supabase
      .from("reviews")
      .select("id, opportunities!inner(org_id)")
      .eq("id", reviewId)
      .single();

    if (reviewErr || !review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.opportunities.org_id !== caller.id) {
      return res.status(403).json({ error: "You can only reply to reviews on your own opportunities" });
    }

    const { data, error } = await supabase
      .from("reviews")
      .update({ org_reply, org_reply_at: new Date().toISOString() })
      .eq("id", reviewId)
      .select();

    if (error) throw error;
    res.json({ message: "Reply saved", data });
  } catch (err) {
    console.error("Error saving reply:", err);
    res.status(500).json({ error: "Failed to save reply" });
  }
});

export default router;