const express = require('express')
const upload  = require('../middleware/upload')
const pool    = require('../db/client')
const { uploadToCloudinary, ensureCloudinaryUrl } = require('../services/cloudinary')
const { renderOutfitChain, renderItemsChain, toAccessoryFeature } = require('../services/perfectCorp')
// Multi-step stylist agent. Each reasoning node runs on Nemotron via Crusoe
// Managed Inference with a Groq fallback (services/llm.js). Replaces the older
// single-shot pairing call — see commit history for buildPairingWithCrusoe.
const { runStylistAgents } = require('../services/stylist/orchestrator')
// Wardrobe-only variant (no new item) — used by the "Try It On" mode on the
// Wardrobe page. Runs in parallel with the Perfect Corp render below.
const { runWardrobeStylistAgents } = require('../services/stylist/wardrobeOrchestrator')

const router = express.Router()

router.post('/', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No photo uploaded' })

    // 1. Upload new item image to Cloudinary
    const cloudResult = await uploadToCloudinary(req.file.buffer, { folder: 'closet/tryon', resource_type: 'image' })
    const newItemUrl  = cloudResult.secure_url

    // 2. Profile photo + wardrobe from Postgres
    const { rows: profileRows } = await pool.query(`SELECT profile_photo_url FROM profile WHERE id = $1`, [req.userId])
    const profilePhotoUrl = profileRows[0]?.profile_photo_url
    if (!profilePhotoUrl) return res.status(400).json({ error: 'No profile photo found. Please complete onboarding first.' })

    const { rows: wardrobe } = await pool.query('SELECT * FROM wardrobe_items WHERE user_id = $1 ORDER BY created_at DESC', [req.userId])

    const { price = '0', category = 'auto', store = '', color = '', gender = '', style = '', base_image_url = '' } = req.body

    // Render base: a saved look ("style this look") takes the place of the profile
    // photo as the canvas the new item is layered onto. Mirror it to Cloudinary so
    // Perfect Corp can fetch it reliably (saved looks store expiring vendor URLs).
    // Stylist analysis still runs against the profile photo so it knows the person.
    let renderBaseUrl = profilePhotoUrl
    if (base_image_url) {
      try {
        renderBaseUrl = await ensureCloudinaryUrl(base_image_url)
      } catch (err) {
        console.warn('[try-on] base look mirror failed, using URL as-is:', err.message)
        renderBaseUrl = base_image_url
      }
    }

    // 3. Multi-step stylist agent — runs on NVIDIA Nemotron via Crusoe Managed
    //    Inference (each LLM node Crusoe-first with a Groq fallback inside
    //    services/llm.js). The orchestrator chains 7 steps: analyzer →
    //    duplicate-checker → candidate generator → stylist + critic →
    //    versatility scorer → gap analyzer → assessment, building a
    //    human-readable `trace` the Results page surfaces.
    let combinations = [], honest_assessment = '', item_name = '', detected_category = '', style_tags = [], similar_owned = ''
    let trace = [], versatility = null, gap = null, fit_note = '', critique = '', duplicates = null
    try {
      const stylist = await runStylistAgents({
        newItemUrl,
        profilePhotoUrl,
        wardrobe,
        // `gender` is what the user told us at onboarding — the analyzer uses it
        // to flag gendered-cut mismatches (men's shoulders on a women's frame
        // etc) and the assessment mirrors that into a plain "skip it".
        hints: { category, price, color, store, gender },
      })
      combinations      = stylist.combinations || []
      honest_assessment = stylist.honest_assessment || ''
      item_name         = stylist.item_name || ''
      detected_category = stylist.detected_category || ''
      style_tags        = stylist.style_tags || []
      similar_owned     = stylist.similar_owned || ''
      trace             = stylist.trace || []
      versatility       = stylist.versatility || null
      gap               = stylist.gap || null
      fit_note          = stylist.fit_note || ''
      critique          = stylist.critique || ''
      duplicates        = stylist.duplicates || null
    } catch (err) {
      console.error('Stylist agent failed:', err.message)
      honest_assessment = 'Style analysis unavailable — check your CRUSOE_API_KEY / GROQ_API_KEY.'
    }

    // 4. Solo render (dispatched by category: clothes vs hat/scarf/bag/shoes).
    //    Accessories are deliberately SKIPPED: Perfect Corp's accessory endpoints
    //    regenerate the entire styled outfit (a hallucinated dress will replace
    //    the user's real one), so a solo try-on with just shoes/hat/bag/scarf is
    //    not visually trustworthy. The frontend routes accessory results
    //    straight to the closet picker, where chaining a body garment after the
    //    accessory restores the real outfit via the clean clothes-V3 swap.
    const renderCategory = detected_category || category
    const accessorySoloSkipped = !!toAccessoryFeature(renderCategory)
    let soloRenderUrl = null
    if (!accessorySoloSkipped) {
      try {
        soloRenderUrl = await renderOutfitChain(renderBaseUrl, newItemUrl, [], renderCategory, gender, style)
      } catch (err) {
        console.error('Solo render failed:', err.message)
      }
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
          compositeUrl = await renderOutfitChain(renderBaseUrl, newItemUrl, safeComboItems, renderCategory, gender, style)
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
      base_image_url: base_image_url || null,
      solo_render_url: soloRenderUrl,
      // True when the new item is an accessory (shoes/hat/bag/scarf) and we
      // intentionally skipped the solo render — the client uses this to route
      // straight to the closet picker for a stable composite.
      accessory_solo_skipped: accessorySoloSkipped,
      honest_assessment,
      combinations: enrichedCombos,
      // Agent-only extras for the Results page. `trace` powers the collapsible
      // "How the stylist thought about this" panel; the others are optional
      // signals the UI can surface later (versatility score, gap analysis, etc).
      trace,
      versatility,
      gap,
      fit_note,
      critique,
      duplicates,
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
// Runs the Nemotron stylist assessment in parallel with the Perfect Corp render.
router.post('/quick', async (req, res) => {
  try {
    const { image_url, category, wardrobe_image_url, wardrobe_category, gender = '',
            price = '0', color = '', store_url = '', name = '' } = req.body
    if (!image_url) return res.status(400).json({ error: 'image_url required' })

    const [{ rows }, { rows: wardrobeRows }] = await Promise.all([
      pool.query(`SELECT profile_photo_url FROM profile WHERE id = $1`, [req.userId]),
      pool.query('SELECT * FROM wardrobe_items WHERE user_id = $1 ORDER BY created_at DESC', [req.userId]),
    ])
    const profilePhotoUrl = rows[0]?.profile_photo_url
    if (!profilePhotoUrl) return res.status(400).json({ error: 'No profile photo found. Complete onboarding first.' })

    // External catalog images must be mirrored to Cloudinary so Perfect Corp can fetch them.
    const safeImageUrl = await ensureCloudinaryUrl(image_url)

    // Run Perfect Corp render + Nemotron stylist assessment in parallel.
    const renderPromise = (async () => {
      if (wardrobe_image_url) {
        try {
          const safeWardrobeUrl = await ensureCloudinaryUrl(wardrobe_image_url)
          return await renderOutfitChain(
            profilePhotoUrl, safeImageUrl,
            [{ image_url: safeWardrobeUrl, category: wardrobe_category }],
            category || 'auto', gender,
          )
        } catch (err) {
          console.warn('[quick try-on] wardrobe layer failed:', err.message)
          return await renderOutfitChain(profilePhotoUrl, safeImageUrl, [], category || 'auto', gender)
        }
      }
      return await renderOutfitChain(profilePhotoUrl, safeImageUrl, [], category || 'auto', gender)
    })()

    const stylistPromise = runStylistAgents({
      newItemUrl: safeImageUrl,
      profilePhotoUrl,
      wardrobe: wardrobeRows,
      hints: { category: category || 'auto', price, color, store: store_url, gender, item_name: name },
    }).catch(err => { console.error('[quick try-on] stylist agent failed:', err.message); return null })

    const [renderUrl, stylist] = await Promise.all([renderPromise, stylistPromise])

    res.json({
      render_url: renderUrl,
      honest_assessment: stylist?.honest_assessment || '',
      item_name:         stylist?.item_name         || name || '',
      detected_category: stylist?.detected_category || category || '',
      style_tags:        stylist?.style_tags         || [],
      similar_owned:     stylist?.similar_owned      || '',
      trace:             stylist?.trace              || [],
      versatility:       stylist?.versatility        || null,
      gap:               stylist?.gap                || null,
      fit_note:          stylist?.fit_note           || '',
    })
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

    const { rows: profileRows } = await pool.query(`SELECT profile_photo_url FROM profile WHERE id = $1`, [req.userId])
    const profilePhotoUrl = profileRows[0]?.profile_photo_url
    if (!profilePhotoUrl) {
      return res.status(400).json({ error: 'No profile photo found. Please complete onboarding first.' })
    }

    const { rows: wardrobe } = await pool.query('SELECT * FROM wardrobe_items WHERE user_id = $1 ORDER BY created_at DESC', [req.userId])

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

// POST /api/tryon/wardrobe — wardrobe-only try-on ("Mix & Match"). Render a set
// of the user's own wardrobe pieces onto the profile photo (or a saved look via
// base_image_url) with no new/external item. Stateless.
router.post('/wardrobe', async (req, res) => {
  try {
    const { wardrobe_item_ids = [], base_image_url = '', gender = '' } = req.body
    if (!Array.isArray(wardrobe_item_ids) || wardrobe_item_ids.length === 0) {
      return res.status(400).json({ error: 'Select at least one wardrobe item.' })
    }

    const { rows: profileRows } = await pool.query(`SELECT profile_photo_url FROM profile WHERE id = $1`, [req.userId])
    const profilePhotoUrl = profileRows[0]?.profile_photo_url
    if (!profilePhotoUrl) return res.status(400).json({ error: 'No profile photo found. Please complete onboarding first.' })

    // Base canvas: profile photo by default, or a saved look if provided.
    let baseUrl = profilePhotoUrl
    if (base_image_url) {
      try {
        baseUrl = await ensureCloudinaryUrl(base_image_url)
      } catch (err) {
        console.warn('[wardrobe try-on] base mirror failed, using URL as-is:', err.message)
        baseUrl = base_image_url
      }
    }

    const { rows: wardrobe } = await pool.query('SELECT * FROM wardrobe_items WHERE user_id = $1 ORDER BY created_at DESC', [req.userId])
    const items = wardrobe_item_ids
      .map(id => wardrobe.find(w => w.id === id))
      .filter(Boolean)
      .slice(0, 4)
    if (items.length === 0) return res.status(400).json({ error: 'Selected items not found.' })

    // Mirror every item image to Cloudinary so Perfect Corp can fetch them.
    const safeItems = await Promise.all(items.map(async (it) => ({
      ...it,
      image_url: await ensureCloudinaryUrl(it.image_url).catch(() => it.image_url),
    })))

    // Run the agentic analysis IN PARALLEL with the Perfect Corp render. The
    // LLM calls are seconds each; the render is minutes. With Promise.all the
    // total wait stays dominated by the render and the agent output comes
    // along for ~free. Agent failures are non-fatal — the user still gets a
    // valid render even if the stylist couldn't be reached.
    //
    // The agent uses profilePhotoUrl (the user's actual photo) for its vision
    // context, not baseUrl — consistent with the new-item try-on, the
    // analyzer needs to see the person to comment on fit.
    const [agentResult, composite_render_url] = await Promise.all([
      runWardrobeStylistAgents({ profilePhotoUrl, items: safeItems, hints: { gender } })
        .catch(err => { console.error('[wardrobe try-on] stylist agent failed:', err.message); return null }),
      renderItemsChain(baseUrl, safeItems, gender),
    ])

    res.json({
      composite_render_url,
      wardrobe_item_details: items.map(w => ({
        id: w.id, category: w.category,
        description: w.description || w.category,
        color: w.color || '', image_url: w.image_url,
      })),
      // Agentic extras — powering the honest take + collapsible trace panel
      // in the Wardrobe modal. All optional; the UI degrades cleanly if null.
      outfit_name:       agentResult?.outfit_name       || '',
      occasion:          agentResult?.occasion          || '',
      formality:         agentResult?.formality         || '',
      palette:           agentResult?.palette           || [],
      fit_note:          agentResult?.fit_note          || '',
      coverage:          agentResult?.coverage          || null,
      critique:          agentResult?.critique          || null,
      honest_assessment: agentResult?.honest_assessment || '',
      trace:             agentResult?.trace             || [],
    })
  } catch (err) {
    console.error('Wardrobe try-on error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
