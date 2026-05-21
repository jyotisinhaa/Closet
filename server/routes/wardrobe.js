const express = require('express')
const crypto = require('crypto')
const upload = require('../middleware/upload')
const { readData, writeData } = require('../lib/db')
const { uploadToCloudinary, destroyFromCloudinary } = require('../services/cloudinary')

const router = express.Router()

// GET /api/wardrobe
router.get('/', (req, res) => {
  const data = readData()
  res.json(data.wardrobe || [])
})

// POST /api/wardrobe
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'closet/wardrobe',
      resource_type: 'image',
    })

    const item = {
      id: crypto.randomUUID(),
      image_url: result.secure_url,
      cloudinary_public_id: result.public_id,
      category: req.body.category || 'top',
      color: req.body.color || '',
      description: req.body.description || '',
      created_at: new Date().toISOString(),
    }

    const data = readData()
    data.wardrobe.push(item)
    writeData(data)

    res.json(item)
  } catch (err) {
    console.error('Wardrobe upload error:', err)
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/wardrobe/:id
router.delete('/:id', async (req, res) => {
  const data = readData()
  const item = data.wardrobe.find(i => i.id === req.params.id)

  if (item?.cloudinary_public_id) {
    try {
      await destroyFromCloudinary(item.cloudinary_public_id, { invalidate: true })
    } catch (err) {
      console.error('Cloudinary delete error:', err)
    }
  }

  data.wardrobe = data.wardrobe.filter(i => i.id !== req.params.id)
  writeData(data)
  res.json({ ok: true })
})

module.exports = router
