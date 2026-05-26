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
      public_id: "demo-user-1",
      overwrite: true,
      resource_type: "image",
    });

    await pool.query(
      `INSERT INTO profile (id, profile_photo_url) VALUES ('demo-user-1', $1)
       ON CONFLICT (id) DO UPDATE SET profile_photo_url = $1, updated_at = NOW()`,
      [result.secure_url],
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
            height_ft, height_cm, size_tops, size_bottoms, size_shoes
     FROM profile WHERE id = 'demo-user-1'`,
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
     VALUES ('demo-user-1', $1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (id) DO UPDATE SET
       name = $1, gender = $2, body_type = $3,
       height_ft = $4, height_cm = $5,
       size_tops = $6, size_bottoms = $7, size_shoes = $8,
       updated_at = NOW()`,
    [
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
  const { gender, bodyType } = req.body;
  await pool.query(
    `INSERT INTO profile (id, gender, body_type) VALUES ('demo-user-1', $1, $2)
     ON CONFLICT (id) DO UPDATE SET gender = $1, body_type = $2, updated_at = NOW()`,
    [gender || null, bodyType || null],
  );
  res.json({ ok: true });
});

router.delete("/", async (req, res) => {
  await pool.query(`DELETE FROM profile WHERE id = 'demo-user-1'`);
  res.json({ ok: true });
});

module.exports = router;
