const express = require('express')
const crypto = require('crypto')
const { readData, writeData } = require('../lib/db')

const router = express.Router()

// GET /api/wishlist
router.get('/', (req, res) => {
  const data = readData()
  res.json(data.wishlist || [])
})

// POST /api/wishlist
router.post('/', (req, res) => {
  const item = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...req.body }
  const data = readData()
  data.wishlist.push(item)
  writeData(data)
  res.json(item)
})

// POST /api/wishlist/:id/purchase — move a wishlist item into the wardrobe
router.post('/:id/purchase', (req, res) => {
  const data = readData()
  const wish = data.wishlist.find(i => i.id === req.params.id)
  if (!wish) return res.status(404).json({ error: 'Not found' })

  const wardrobeItem = {
    id: crypto.randomUUID(),
    image_url: wish.new_item_image_url,
    category: wish.category,
    color: '',
    description: wish.description || '',
    created_at: new Date().toISOString(),
  }
  data.wardrobe.push(wardrobeItem)
  data.wishlist = data.wishlist.filter(i => i.id !== req.params.id)
  writeData(data)

  res.json(wardrobeItem)
})

// DELETE /api/wishlist/:id
router.delete('/:id', (req, res) => {
  const data = readData()
  data.wishlist = data.wishlist.filter(i => i.id !== req.params.id)
  writeData(data)
  res.json({ ok: true })
})

module.exports = router
