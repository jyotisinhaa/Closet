// Saved looks ("Lookbook"): generated try-on renders the user liked.
const express = require('express')
const pool    = require('../db/client')

const router = express.Router()

router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM saved_looks WHERE user_id = $1 ORDER BY created_at DESC',
    [req.userId],
  )
  res.json(rows)
})

router.post('/', async (req, res) => {
  const { render_url, title, item_name, category, price, source, item_image_urls } = req.body
  if (!render_url) return res.status(400).json({ error: 'render_url is required' })

  // Deduplicate by render URL + user — return the existing row if already liked.
  const { rows: existing } = await pool.query(
    'SELECT * FROM saved_looks WHERE render_url = $1 AND user_id = $2 LIMIT 1',
    [render_url, req.userId],
  )
  if (existing.length > 0) return res.json(existing[0])

  const { rows } = await pool.query(
    `INSERT INTO saved_looks (user_id, render_url, title, item_name, category, price, source, item_image_urls)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [req.userId, render_url, title || '', item_name || '', category || '', parseFloat(price) || 0, source || 'solo', JSON.stringify(item_image_urls || [])]
  )
  res.json(rows[0])
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM saved_looks WHERE id = $1 AND user_id = $2', [req.params.id, req.userId])
  res.json({ ok: true })
})

module.exports = router
