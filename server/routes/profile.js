const express = require('express')
const upload = require('../middleware/upload')
const { readData, writeData } = require('../lib/db')
const { uploadToCloudinary } = require('../services/cloudinary')

const router = express.Router()

// POST /api/profile/photo
router.post('/photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'closet/profile',
      public_id: 'demo-user-1',
      overwrite: true,
      resource_type: 'image',
    })

    const data = readData()
    data.user = { id: 'demo-user-1', profile_photo_url: result.secure_url }
    writeData(data)

    res.json({ profile_photo_url: result.secure_url })
  } catch (err) {
    console.error('Profile upload error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/profile
router.get('/', (req, res) => {
  const data = readData()
  res.json(data.user || {})
})

module.exports = router
