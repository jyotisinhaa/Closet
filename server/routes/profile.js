const express = require("express");
const upload = require("../middleware/upload");
const pool = require("../db/client");
const { uploadToCloudinary } = require("../services/cloudinary");

const router = express.Router();

router.post("/photo", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "closet/profile",
      public_id: req.userId,
      overwrite: true,
      resource_type: "image",
    });

    await pool.query(
      `INSERT INTO profile (id, profile_photo_url) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET profile_photo_url = $2, updated_at = NOW()`,
      [req.userId, result.secure_url],
    );

    res.json({ profile_photo_url: result.secure_url });
  } catch (err) {
    console.error("Profile upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, profile_photo_url, name, gender, body_type,
            height_ft, height_cm, size_tops, size_bottoms, size_shoes,
            style_profile, style_prefs
     FROM profile WHERE id = $1`,
    [req.userId],
  );
  res.json(rows[0] || {});
});

router.patch("/", async (req, res) => {
  const {
    name,
    gender,
    bodyType,
    heightFt,
    heightCm,
    sizeTops,
    sizeBottoms,
    sizeShoes,
  } = req.body;
  await pool.query(
    `INSERT INTO profile (id, name, gender, body_type, height_ft, height_cm, size_tops, size_bottoms, size_shoes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (id) DO UPDATE SET
       name = $2, gender = $3, body_type = $4,
       height_ft = $5, height_cm = $6,
       size_tops = $7, size_bottoms = $8, size_shoes = $9,
       updated_at = NOW()`,
    [
      req.userId,
      name || "",
      gender || "",
      bodyType || "",
      heightFt || "",
      heightCm || "",
      sizeTops || "",
      sizeBottoms || "",
      sizeShoes || "",
    ],
  );
  res.json({ ok: true });
});

router.patch("/preferences", async (req, res) => {
  const { gender, bodyType, name } = req.body;
  await pool.query(
    `INSERT INTO profile (id, name, gender, body_type) VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE SET name = COALESCE($2, profile.name), gender = $3, body_type = $4, updated_at = NOW()`,
    [req.userId, name || null, gender || null, bodyType || null],
  );
  res.json({ ok: true });
});

router.delete("/", async (req, res) => {
  await pool.query(`DELETE FROM profile WHERE id = $1`, [req.userId]);
  res.json({ ok: true });
});

module.exports = router;
