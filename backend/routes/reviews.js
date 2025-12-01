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
    // 1️⃣ Auth0 user ID from JWT
    const auth0Sub = req.auth.payload.sub;

    // 2️⃣ Get the internal Supabase UUID
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", auth0Sub)
      .single();

    if (userErr || !user) {
      return res.status(400).json({ error: "User not found in database" });
    }

    const verifiedUserId = user.id;

    // 3️⃣ Create the review using internal UUID
    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          opportunity_id: id,
          student_id: verifiedUserId, // <-- NOT req.body.user_id
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

export default router;