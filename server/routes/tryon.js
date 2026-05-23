const express = require('express')
const upload = require('../middleware/upload')
const { readData } = require('../lib/db')
const { uploadToCloudinary } = require('../services/cloudinary')
const { toPerfectCorpCategory, renderOutfitChain } = require('../services/perfectCorp')
const { buildPairingWithGroq } = require('../services/groq')

const router = express.Router()

// POST /api/tryon — upload item, analyze with Groq, render solo + combo looks.
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No photo uploaded' })

    // 1. Upload new item image to Cloudinary
    const cloudResult = await uploadToCloudinary(req.file.buffer, {
      folder: 'closet/tryon',
      resource_type: 'image',
    })
    const newItemUrl = cloudResult.secure_url

    // 2. Profile photo + wardrobe
    const data = readData()
    const profilePhotoUrl = data.user?.profile_photo_url
    if (!profilePhotoUrl) {
      return res.status(400).json({ error: 'No profile photo found. Please complete onboarding first.' })
    }
    const wardrobe = data.wardrobe || []

    const { price = '0', category = 'auto', store = '', color = '' } = req.body

    // 3. Pairing analysis via Groq
    let combinations = [], honest_assessment = '', item_name = '', detected_category = '', style_tags = [], similar_owned = ''
    try {
      const pairing = await buildPairingWithGroq(newItemUrl, profilePhotoUrl, category, price, color, store, wardrobe)
      combinations       = pairing.combinations || []
      honest_assessment  = pairing.honest_assessment || ''
      item_name          = pairing.item_name || ''
      detected_category  = pairing.detected_category || ''
      style_tags         = pairing.style_tags || []
      similar_owned      = pairing.similar_owned || ''
    } catch (err) {
      console.error('Groq pairing failed:', err.message)
      honest_assessment = 'Style analysis unavailable — check your GROQ_API_KEY.'
    }

    // 4. Solo render (profile + new item only)
    const pcCategory = toPerfectCorpCategory(detected_category || category)
    let soloRenderUrl = null
    try {
      soloRenderUrl = await renderOutfitChain(profilePhotoUrl, newItemUrl, [], pcCategory)
    } catch (err) {
      console.error('Solo render failed:', err.message)
    }

    // 5. Combo renders (run in parallel — each combo's chain is sequential internally)
    const enrichedCombos = await Promise.all(
      combinations.slice(0, 2).map(async (combo) => {
        const comboItems = (combo.wardrobe_item_ids || [])
          .map(id => wardrobe.find(w => w.id === id))
          .filter(Boolean)
          .slice(0, 3)

        let compositeUrl = soloRenderUrl
        try {
          compositeUrl = await renderOutfitChain(profilePhotoUrl, newItemUrl, comboItems, pcCategory)
        } catch (err) {
          console.error(`Combo render failed for "${combo.name}":`, err.message)
        }

        return {
          name: combo.name,
          styling_note: combo.styling_note,
          wardrobe_item_ids: combo.wardrobe_item_ids,
          wardrobe_item_details: comboItems.map(w => ({
            id: w.id,
            category: w.category,
            description: w.description || w.category,
            color: w.color || '',
            image_url: w.image_url,
          })),
          composite_render_url: compositeUrl,
        }
      })
    )

    res.json({
      new_item_image_url: newItemUrl,
      price: parseFloat(price) || 0,
      category,
      store,
      color,
      item_name,
      detected_category,
      style_tags,
      similar_owned,
      solo_render_url: soloRenderUrl,
      honest_assessment,
      combinations: enrichedCombos,
    })
  } catch (err) {
    console.error('Try-on error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
