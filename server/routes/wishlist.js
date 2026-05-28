const express = require('express')
const pool    = require('../db/client')

const router = express.Router()

router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM wishlist_items WHERE user_id = $1 ORDER BY added_at DESC',
    [req.userId],
  )
  res.json(rows)
})

router.post('/', async (req, res) => {
  const { item_name, new_item_image_url, category, price, store, color, solo_render_url, combinations, honest_assessment } = req.body

  // Deduplicate by image URL + user
  if (new_item_image_url) {
    const { rows: existing } = await pool.query(
      'SELECT * FROM wishlist_items WHERE new_item_image_url = $1 AND user_id = $2 LIMIT 1',
      [new_item_image_url, req.userId],
    )
    if (existing.length > 0) return res.json(existing[0])
  }

  const { rows } = await pool.query(
    `INSERT INTO wishlist_items (user_id, item_name, new_item_image_url, category, price, store, color, solo_render_url, combinations, honest_assessment)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [req.userId, item_name, new_item_image_url, category, parseFloat(price) || null, store || '', color || '', solo_render_url, JSON.stringify(combinations || []), honest_assessment || '']
  )
  res.json(rows[0])
})

// Move wishlist item into wardrobe
router.post('/:id/purchase', async (req, res) => {
  const { rows: wishRows } = await pool.query(
    'SELECT * FROM wishlist_items WHERE id = $1 AND user_id = $2',
    [req.params.id, req.userId],
  )
  const wish = wishRows[0]
  if (!wish) return res.status(404).json({ error: 'Not found' })

  const { rows } = await pool.query(
    `INSERT INTO wardrobe_items (user_id, image_url, category, description, price)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [req.userId, wish.new_item_image_url, wish.category || 'Uncategorized', wish.item_name || wish.category || '', parseFloat(wish.price) || 0]
  )
  await pool.query('DELETE FROM wishlist_items WHERE id = $1 AND user_id = $2', [req.params.id, req.userId])
  res.json(rows[0])
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM wishlist_items WHERE id = $1 AND user_id = $2', [req.params.id, req.userId])
  res.json({ ok: true })
})

module.exports = router
