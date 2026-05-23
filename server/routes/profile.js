const express = require('express')
const upload  = require('../middleware/upload')
const pool    = require('../db/client')
const { uploadToCloudinary } = require('../services/cloudinary')

const router = express.Router()

router.post('/photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'closet/profile',
      public_id: 'demo-user-1',
      overwrite: true,
      resource_type: 'image',
    })

    await pool.query(
      `INSERT INTO profile (id, profile_photo_url) VALUES ('demo-user-1', $1)
       ON CONFLICT (id) DO UPDATE SET profile_photo_url = $1, updated_at = NOW()`,
      [result.secure_url]
    )

    res.json({ profile_photo_url: result.secure_url })
  } catch (err) {
    console.error('Profile upload error:', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/', async (req, res) => {
  const { rows } = await pool.query(`SELECT * FROM profile WHERE id = 'demo-user-1'`)
  res.json(rows[0] || {})
})

router.delete('/', async (req, res) => {
  await pool.query(`DELETE FROM profile WHERE id = 'demo-user-1'`)
  res.json({ ok: true })
})

module.exports = router
