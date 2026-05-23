const express = require('express')
const pool    = require('../db/client')

const router = express.Router()

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM wishlist_items ORDER BY added_at DESC')
  res.json(rows)
})

router.post('/', async (req, res) => {
  const { item_name, new_item_image_url, category, price, store, color, solo_render_url, combinations, honest_assessment } = req.body

  // Deduplicate by image URL — return existing row if already saved
  if (new_item_image_url) {
    const { rows: existing } = await pool.query(
      'SELECT * FROM wishlist_items WHERE new_item_image_url = $1 LIMIT 1',
      [new_item_image_url]
    )
    if (existing.length > 0) return res.json(existing[0])
  }

  const { rows } = await pool.query(
    `INSERT INTO wishlist_items (item_name, new_item_image_url, category, price, store, color, solo_render_url, combinations, honest_assessment)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [item_name, new_item_image_url, category, parseFloat(price) || null, store || '', color || '', solo_render_url, JSON.stringify(combinations || []), honest_assessment || '']
  )
  res.json(rows[0])
})

// Move wishlist item into wardrobe
router.post('/:id/purchase', async (req, res) => {
  const { rows: wishRows } = await pool.query('SELECT * FROM wishlist_items WHERE id = $1', [req.params.id])
  const wish = wishRows[0]
  if (!wish) return res.status(404).json({ error: 'Not found' })

  const { rows } = await pool.query(
    `INSERT INTO wardrobe_items (image_url, category, description)
     VALUES ($1, $2, $3) RETURNING *`,
    [wish.new_item_image_url, wish.category || 'Uncategorized', wish.item_name || wish.category || '']
  )
  await pool.query('DELETE FROM wishlist_items WHERE id = $1', [req.params.id])
  res.json(rows[0])
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM wishlist_items WHERE id = $1', [req.params.id])
  res.json({ ok: true })
})

module.exports = router
