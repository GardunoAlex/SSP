import express from "express";
import { jwtCheck } from "../middleware/jwtCheck.js";
import { attachUser } from "../middleware/attachUser.js";
import { requireStudent } from "../middleware/roles.js";
import { requireOrg } from "../middleware/roles.js";
import { getOrgReviews } from "../services/userService.js";
import { getStudentReviews } from "../services/userService.js";
import { getOpportunityReviews } from "../services/userService.js";
import { createReview } from "../services/userService.js";
import { verifyOrgReviewOwnership } from "../services/userService.js";
import { orgReviewReply } from "../services/userService.js";
import { verifyStudentReviewOwnership } from "../services/userService.js";
import { studentReviewEdit } from "../services/userService.js";
import { studentReviewDelete } from "../services/userService.js";

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

// Creating a new review
router.post("/:id", jwtCheck, attachUser, requireStudent, async (req, res) => {
  // param id is the ID of the opportunity
  const { id } = req.params;
  const { title, review, rating } = req.body;
  const studentId = req.user.id;
  try {
    const newReview = await createReview(id, studentId, { title, review, rating })
    res.json({ message: "Review Created", newReview });
  } catch (err) {
    console.error("Error Creating Review:", err);
    res.status(500).json({ error: "Failed to Create Review" });
  }
});

// Org replies to a review on their own opportunity
router.patch("/:reviewId/reply", jwtCheck, attachUser, requireOrg, async (req, res) => {
  const { reviewId } = req.params;
  const { org_reply } = req.body;
  try {
    const userId = req.user.id;
    await verifyOrgReviewOwnership(userId, reviewId);
    const data = await orgReviewReply(reviewId, org_reply);
    res.json({ message: "Reply saved", data });
} catch (err) {
    if (err.message === "Review not found") {
        return res.status(404).json({ error: "Review not found" });
    }
    if (err.message === "Unauthorized") {
        return res.status(403).json({ error: "You can only reply to reviews on your own opportunities" });
    }
    console.error("Error saving reply:", err);
    res.status(500).json({ error: "Failed to save reply" });
  }
});

// Student edits their own review
router.patch("/:reviewId", jwtCheck, attachUser, requireStudent, async (req, res) => {
  const { reviewId } = req.params;
  const { title, review, rating } = req.body;
  const userId = req.user.id;
  try {
    await verifyStudentReviewOwnership(userId, reviewId);
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (review !== undefined) updates.review = review;
    if (rating !== undefined) updates.rating = rating;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const updatedReview = await studentReviewEdit(reviewId, updates)
    res.json({ message: "Review updated", updatedReview });
  } catch (err) {
    if (err.message === "Review not found") {
      return res.status(404).json({ error: "Review not found" });
    }
    if (err.message === "Unauthorized") {
      return res.status(403).json({ error: "You can only edit your own reviews" });
    }
    console.error("Error updating review:", err);
    res.status(500).json({ error: "Failed to update review" });
  }
});

// Student deletes their own review
router.delete("/:reviewId", jwtCheck, attachUser, requireStudent, async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id;
  try {
    await verifyStudentReviewOwnership(userId, reviewId);
    await studentReviewDelete(reviewId);
    res.json({ message: "Review deleted" });
  } catch (err) {
    if (err.message === "Review not found") {
      return res.status(404).json({ error: "Review not found" });
    }
    if (err.message === "Unauthorized") {
      return res.status(403).json({ error: "You can only edit/delete your own reviews" });
    }
    console.error("Error deleting review:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;