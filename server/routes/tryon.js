const express = require('express')
const upload  = require('../middleware/upload')
const pool    = require('../db/client')
const { uploadToCloudinary, ensureCloudinaryUrl } = require('../services/cloudinary')
const { renderOutfitChain }                = require('../services/perfectCorp')
const { buildPairingWithGroq }             = require('../services/groq')

const router = express.Router()

router.post('/', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No photo uploaded' })

    // 1. Upload new item image to Cloudinary
    const cloudResult = await uploadToCloudinary(req.file.buffer, { folder: 'closet/tryon', resource_type: 'image' })
    const newItemUrl  = cloudResult.secure_url

    // 2. Profile photo + wardrobe from Postgres
    const { rows: profileRows } = await pool.query(`SELECT profile_photo_url FROM profile WHERE id = 'demo-user-1'`)
    const profilePhotoUrl = profileRows[0]?.profile_photo_url
    if (!profilePhotoUrl) return res.status(400).json({ error: 'No profile photo found. Please complete onboarding first.' })

    const { rows: wardrobe } = await pool.query('SELECT * FROM wardrobe_items ORDER BY created_at DESC')

    const { price = '0', category = 'auto', store = '', color = '', gender = '', style = '' } = req.body

    // 3. Pairing analysis via Groq
    let combinations = [], honest_assessment = '', item_name = '', detected_category = '', style_tags = [], similar_owned = ''
    try {
      const pairing    = await buildPairingWithGroq(newItemUrl, profilePhotoUrl, category, price, color, store, wardrobe)
      combinations     = pairing.combinations || []
      honest_assessment = pairing.honest_assessment || ''
      item_name        = pairing.item_name || ''
      detected_category = pairing.detected_category || ''
      style_tags       = pairing.style_tags || []
      similar_owned    = pairing.similar_owned || ''
    } catch (err) {
      console.error('Groq pairing failed:', err.message)
      honest_assessment = 'Style analysis unavailable — check your GROQ_API_KEY.'
    }

    // 4. Solo render (dispatched by category: clothes vs hat/scarf/bag/shoes)
    const renderCategory = detected_category || category
    let soloRenderUrl = null
    try {
      soloRenderUrl = await renderOutfitChain(profilePhotoUrl, newItemUrl, [], renderCategory, gender, style)
    } catch (err) {
      console.error('Solo render failed:', err.message)
    }

    // 5. Combo renders
    const enrichedCombos = await Promise.all(
      combinations.slice(0, 2).map(async (combo) => {
        const comboItems = (combo.wardrobe_item_ids || [])
          .map(id => wardrobe.find(w => w.id === id))
          .filter(Boolean)
          .filter(w => w.category !== 'Scarf') // scarves get erased by the clothes layer — never pair them
          .slice(0, 3)

        // Ensure all wardrobe item images are on Cloudinary before passing to Perfect Corp
        const safeComboItems = await Promise.all(
          comboItems.map(async (item) => ({
            ...item,
            image_url: await ensureCloudinaryUrl(item.image_url).catch(() => item.image_url),
          }))
        )

        let compositeUrl = soloRenderUrl
        try {
          compositeUrl = await renderOutfitChain(profilePhotoUrl, newItemUrl, safeComboItems, renderCategory, gender, style)
        } catch (err) {
          console.error(`Combo render failed for "${combo.name}":`, err.message)
        }

        return {
          name: combo.name,
          styling_note: combo.styling_note,
          wardrobe_item_ids: combo.wardrobe_item_ids,
          wardrobe_item_details: safeComboItems.map(w => ({
            id: w.id, category: w.category,
            description: w.description || w.category,
            color: w.color || '', image_url: w.image_url,
          })),
          composite_render_url: compositeUrl,
        }
      })
    )

    res.json({
      new_item_image_url: newItemUrl,
      price: parseFloat(price) || 0,
      category, store, color,
      item_name, detected_category, style_tags, similar_owned,
      solo_render_url: soloRenderUrl,
      honest_assessment,
      combinations: enrichedCombos,
    })
  } catch (err) {
    console.error('Try-on error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/tryon/quick — try a recommended catalog item on the profile photo,
// optionally paired with one of the user's wardrobe items. The catalog item is
// the focus (rendered last/on top). Falls back to catalog-only if the wardrobe
// layer fails (e.g. a lifestyle photo that can't be processed).
router.post('/quick', async (req, res) => {
  try {
    const { image_url, category, wardrobe_image_url, wardrobe_category, gender = '' } = req.body
    if (!image_url) return res.status(400).json({ error: 'image_url required' })

    const { rows } = await pool.query(`SELECT profile_photo_url FROM profile WHERE id = 'demo-user-1'`)
    const profilePhotoUrl = rows[0]?.profile_photo_url
    if (!profilePhotoUrl) return res.status(400).json({ error: 'No profile photo found. Complete onboarding first.' })

    // External catalog images (e.g. Unsplash) must be mirrored to Cloudinary so
    // Perfect Corp can reliably fetch them.
    const safeImageUrl = await ensureCloudinaryUrl(image_url)

    let renderUrl
    if (wardrobe_image_url) {
      try {
        const safeWardrobeUrl = await ensureCloudinaryUrl(wardrobe_image_url)
        renderUrl = await renderOutfitChain(
          profilePhotoUrl,
          safeImageUrl,
          [{ image_url: safeWardrobeUrl, category: wardrobe_category }],
          category || 'auto',
          gender,
        )
      } catch (err) {
        console.warn('[quick try-on] wardrobe layer failed:', err.message)
        renderUrl = await renderOutfitChain(profilePhotoUrl, safeImageUrl, [], category || 'auto', gender)
      }
    } else {
      renderUrl = await renderOutfitChain(profilePhotoUrl, safeImageUrl, [], category || 'auto', gender)
    }

    res.json({ render_url: renderUrl })
  } catch (err) {
    console.error('Quick try-on error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/tryon/combine — render the new item layered with user-chosen
// wardrobe items (manual "build your own look"). Stateless; reuses the chain.
router.post('/combine', async (req, res) => {
  try {
    const { new_item_image_url, garment_category, wardrobe_item_ids = [], gender = '' } = req.body
    if (!new_item_image_url) return res.status(400).json({ error: 'new_item_image_url is required' })

    const { rows: profileRows } = await pool.query(`SELECT profile_photo_url FROM profile WHERE id = 'demo-user-1'`)
    const profilePhotoUrl = profileRows[0]?.profile_photo_url
    if (!profilePhotoUrl) {
      return res.status(400).json({ error: 'No profile photo found. Please complete onboarding first.' })
    }

    const { rows: wardrobe } = await pool.query('SELECT * FROM wardrobe_items ORDER BY created_at DESC')

    // Resolve selected wardrobe items (max 3), preserving the user's order.
    const items = wardrobe_item_ids
      .map(id => wardrobe.find(w => w.id === id))
      .filter(Boolean)
      .slice(0, 3)

    const composite_render_url = await renderOutfitChain(profilePhotoUrl, new_item_image_url, items, garment_category, gender)

    res.json({
      composite_render_url,
      wardrobe_item_details: items.map(w => ({
        id: w.id,
        category: w.category,
        description: w.description || w.category,
        color: w.color || '',
        image_url: w.image_url,
      })),
    })
  } catch (err) {
    console.error('Combine try-on error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
