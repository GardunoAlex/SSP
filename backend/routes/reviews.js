import express from "express";
import supabase from "../supabaseClient.js";
import { jwtCheck } from "../middleware/jwtCheck.js";
import { attachUser } from "../middleware/attachUser.js";
import { requireStudent } from "../middleware/roles.js";
import { getOrgReviews } from "../services/userService.js";
import { getStudentReviews } from "../services/userService.js";
import { getOpportunityReviews } from "../services/userService.js";

const router = express.Router();

// Get all reviews for an organization (across all its opportunities)
// Must be defined before /:id to avoid "org" being matched as an id
router.get("/org/:orgId", async (req, res) => {
  const { orgId } = req.params;
  try {
    const reviews = await getOrgReviews(orgId);
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching org reviews:", err);
    res.status(500).json({ error: "Failed to fetch organization reviews" });
  }
});

// Get all reviews written by the authenticated student (derived from JWT)
// Must be defined before /:id to avoid "mine" being matched as an id
router.get("/mine", jwtCheck, attachUser, requireStudent, async (req, res) => {
  try {
    const studentId = req.user.id;
    const reviews = await getStudentReviews(studentId);
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching student reviews:", err);
    res.status(500).json({ error: "Failed to fetch student reviews" });
  }
});

// get the opportunity reviews
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
      const reviews = await getOpportunityReviews(id);
      res.json(reviews);
  } catch (err) {
      console.error("reviews fetch was unsuccessful", err);
      res.status(500).json({error: "Failed to Fetch Reviews"});
  }
});

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

// Student edits their own review
router.patch("/:reviewId", jwtCheck, async (req, res) => {
  const { reviewId } = req.params;
  const { title, review, rating } = req.body;

  try {
    const auth0Sub = req.auth.payload.sub;

    const { data: caller, error: callerErr } = await supabase
      .from("users")
      .select("id, role")
      .eq("auth_id", auth0Sub)
      .single();

    if (callerErr || !caller) {
      return res.status(400).json({ error: "User not found in database" });
    }

    if (caller.role === "org") {
      return res.status(403).json({ error: "Organizations cannot edit reviews" });
    }

    const { data: existingReview, error: fetchErr } = await supabase
      .from("reviews")
      .select("id, student_id")
      .eq("id", reviewId)
      .single();

    if (fetchErr || !existingReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (existingReview.student_id !== caller.id) {
      return res.status(403).json({ error: "You can only edit your own reviews" });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (review !== undefined) updates.review = review;
    if (rating !== undefined) updates.rating = rating;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const { data, error } = await supabase
      .from("reviews")
      .update(updates)
      .eq("id", reviewId)
      .select();

    if (error) throw error;
    res.json({ message: "Review updated", data });
  } catch (err) {
    console.error("Error updating review:", err);
    res.status(500).json({ error: "Failed to update review" });
  }
});

// Student deletes their own review
router.delete("/:reviewId", jwtCheck, async (req, res) => {
  const { reviewId } = req.params;
  try {
    const auth0Sub = req.auth.payload.sub;

    const { data: caller, error: callerErr } = await supabase
      .from("users")
      .select("id, role")
      .eq("auth_id", auth0Sub)
      .single();

    if (callerErr || !caller) {
      return res.status(400).json({ error: "User not found in database" });
    }

    if (caller.role === "org") {
      return res.status(403).json({ error: "Organizations cannot delete reviews" });
    }

    const { data: existingReview, error: fetchErr } = await supabase
      .from("reviews")
      .select("id, student_id")
      .eq("id", reviewId)
      .single();

    if (fetchErr || !existingReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (existingReview.student_id !== caller.id) {
      return res.status(403).json({ error: "You can only delete your own reviews" });
    }

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) throw error;
    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;