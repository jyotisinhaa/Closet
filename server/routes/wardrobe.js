const express = require('express')
const upload  = require('../middleware/upload')
const pool    = require('../db/client')
const { uploadToCloudinary, destroyFromCloudinary } = require('../services/cloudinary')
const { getImageEmbedding } = require('../services/fashionclip')

const router = express.Router()

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM wardrobe_items ORDER BY created_at DESC')
  res.json(rows)
})

// Add from image URL (used by "Bought it" in wishlist)
router.post('/from-url', async (req, res) => {
  const { image_url, category, description, color } = req.body
  if (!image_url) return res.status(400).json({ error: 'image_url required' })

  const { rows } = await pool.query(
    `INSERT INTO wardrobe_items (image_url, category, description, color)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [image_url, category || 'Uncategorized', description || category || '', color || '']
  )
  const item = rows[0]

  // Embed in background — don't block the response
  getImageEmbedding(image_url)
    .then(emb => pool.query('UPDATE wardrobe_items SET embedding = $1 WHERE id = $2', [`[${emb.join(',')}]`, item.id]))
    .catch(err => console.error('Wardrobe embed failed:', err.message))

  res.json(item)
})

router.post('/', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'closet/wardrobe',
      resource_type: 'image',
    })

    const { rows } = await pool.query(
      `INSERT INTO wardrobe_items (image_url, cloudinary_public_id, category, color, description)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [result.secure_url, result.public_id, req.body.category || 'top', req.body.color || '', req.body.description || '']
    )
    const item = rows[0]

    // Embed in background — don't block the response
    getImageEmbedding(result.secure_url)
      .then(emb => pool.query('UPDATE wardrobe_items SET embedding = $1 WHERE id = $2', [`[${emb.join(',')}]`, item.id]))
      .catch(err => console.error('Wardrobe embed failed:', err.message))

    res.json(item)
  } catch (err) {
    console.error('Wardrobe upload error:', err)
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT cloudinary_public_id FROM wardrobe_items WHERE id = $1', [req.params.id])
  const item = rows[0]

  if (item?.cloudinary_public_id) {
    try { await destroyFromCloudinary(item.cloudinary_public_id, { invalidate: true }) } catch {}
  }

  await pool.query('DELETE FROM wardrobe_items WHERE id = $1', [req.params.id])
  res.json({ ok: true })
})

module.exports = router
