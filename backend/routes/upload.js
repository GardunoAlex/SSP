import express from "express";
import multer from "multer";
import supabase from "../supabaseClient.js";
import fetch from "node-fetch";

const router = express.Router();

// Multer: store in memory buffer (we upload to Supabase Storage, not disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed."));
    }
  },
});

// Helper: resolve Auth0 token → Supabase org user
async function getOrgUser(token) {
  let sub = null;
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf-8"));
    sub = decoded?.sub;
  } catch (err) {
    // fallback to userinfo
  }

  if (!sub) {
    const userRes = await fetch("https://dev-hdl1kw87a8apz4ni.us.auth0.com/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!userRes.ok) throw new Error("Failed to fetch Auth0 userinfo");
    const user = await userRes.json();
    sub = user.sub;
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, role")
    .eq("auth_id", sub)
    .maybeSingle();

  if (error || !data) throw new Error("User not found");
  if (data.role !== "org") throw new Error("Only organizations can upload banners");
  return data;
}

// POST /api/upload/banner
router.post("/banner", upload.single("image"), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Missing auth token" });

    const orgUser = await getOrgUser(token);
    const { entity_type, entity_id } = req.body;

    if (!entity_type || !entity_id) {
      return res.status(400).json({ error: "entity_type and entity_id are required" });
    }
    if (!["org", "opportunity"].includes(entity_type)) {
      return res.status(400).json({ error: "entity_type must be 'org' or 'opportunity'" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Ownership check: org can only upload for themselves or their own opportunities
    if (entity_type === "org" && entity_id !== orgUser.id) {
      return res.status(403).json({ error: "You can only upload banners for your own organization" });
    }

    if (entity_type === "opportunity") {
      const { data: opp, error: oppErr } = await supabase
        .from("opportunities")
        .select("org_id")
        .eq("id", entity_id)
        .single();

      if (oppErr || !opp) return res.status(404).json({ error: "Opportunity not found" });
      if (opp.org_id !== orgUser.id) {
        return res.status(403).json({ error: "You can only upload banners for your own opportunities" });
      }
    }

    // Build storage path and upload
    const ext = req.file.originalname.split(".").pop() || "jpg";
    const storagePath = `${entity_type}s/${entity_id}/banner.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("banners")
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("banners")
      .getPublicUrl(storagePath);

    const banner_url = urlData.publicUrl;

    // Save the URL to the correct table
    if (entity_type === "org") {
      const { error: updateErr } = await supabase
        .from("users")
        .update({ banner_url })
        .eq("id", entity_id);
      if (updateErr) throw updateErr;
    } else {
      const { error: updateErr } = await supabase
        .from("opportunities")
        .update({ banner_url })
        .eq("id", entity_id);
      if (updateErr) throw updateErr;
    }

    res.json({ banner_url });
  } catch (err) {
    console.error("Upload error:", err);
    if (err.message?.includes("Invalid file type")) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message || "Failed to upload banner" });
  }
});

export default router;
