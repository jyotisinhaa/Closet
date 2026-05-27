const express = require('express')
const pool    = require('../db/client')
const { getImageEmbedding } = require('../services/fashionclip')
const { rankCandidates } = require('../services/llm')

const router = express.Router()

// GET /api/catalog
router.get('/catalog', async (req, res) => {
  const { rows } = await pool.query('SELECT id, brand, name, category, color, price, store_url, image_url, style_tags, sponsored, added_at FROM catalog_items ORDER BY added_at DESC')
  res.json(rows)
})

// POST /api/catalog
router.post('/catalog', async (req, res) => {
  const { brand, name, category, color, price, store_url, image_url, style_tags, gender } = req.body
  if (!image_url || !category) return res.status(400).json({ error: 'image_url and category required' })

  let embedding = null
  try {
    embedding = await getImageEmbedding(image_url)
  } catch (err) {
    console.error('Embedding failed:', err.message)
  }

  const { rows } = await pool.query(
    `INSERT INTO catalog_items (brand, name, category, color, price, store_url, image_url, style_tags, sponsored, gender, embedding)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,$9,$10) RETURNING *`,
    [brand || 'H&M', name || category, category, color || '', parseFloat(price) || 0, store_url || '', image_url, style_tags || [], gender || 'female', embedding ? `[${embedding.join(',')}]` : null]
  )
  res.json(rows[0])
})

// POST /api/catalog/embed-all — compute missing embeddings for catalog + wardrobe
router.post('/catalog/embed-all', async (req, res) => {
  const { rows: catalogItems } = await pool.query('SELECT id, image_url FROM catalog_items WHERE embedding IS NULL')
  const { rows: wardrobeItems } = await pool.query('SELECT id, image_url FROM wardrobe_items WHERE embedding IS NULL')

  let catalogDone = 0, wardrobeDone = 0
  const sleep = ms => new Promise(r => setTimeout(r, ms))

  for (const item of catalogItems) {
    try {
      const emb = await getImageEmbedding(item.image_url)
      await pool.query('UPDATE catalog_items SET embedding = $1 WHERE id = $2', [`[${emb.join(',')}]`, item.id])
      catalogDone++
    } catch (err) {
      console.error(`Catalog embed failed ${item.id}:`, err.message, err.cause)
    }
    await sleep(300)
  }

  for (const item of wardrobeItems) {
    try {
      const emb = await getImageEmbedding(item.image_url)
      await pool.query('UPDATE wardrobe_items SET embedding = $1 WHERE id = $2', [`[${emb.join(',')}]`, item.id])
      wardrobeDone++
    } catch (err) {
      console.error(`Wardrobe embed failed ${item.id}:`, err.message)
    }
    await sleep(300)
  }

  res.json({ ok: true, catalogEmbedded: catalogDone, wardrobeEmbedded: wardrobeDone })
})

// GET /api/recommendations — pgvector cosine similarity matching
router.get('/recommendations', async (req, res) => {
  try {
    // Resolve the user's gender so we can filter catalog items
    const { rows: profileRows } = await pool.query(`SELECT gender FROM profile WHERE id = 'demo-user-1' LIMIT 1`)
    const userGender = (profileRows[0]?.gender || '').toLowerCase().trim()

    // Lazily embed any wardrobe items missing embeddings
    const { rows: missing } = await pool.query('SELECT id, image_url FROM wardrobe_items WHERE embedding IS NULL')
    for (const item of missing) {
      try {
        const emb = await getImageEmbedding(item.image_url)
        await pool.query('UPDATE wardrobe_items SET embedding = $1 WHERE id = $2', [`[${emb.join(',')}]`, item.id])
      } catch {}
    }

    // Lazily embed catalog items too
    const { rows: missingCat } = await pool.query('SELECT id, image_url FROM catalog_items WHERE embedding IS NULL')
    for (const item of missingCat) {
      try {
        const emb = await getImageEmbedding(item.image_url)
        await pool.query('UPDATE catalog_items SET embedding = $1 WHERE id = $2', [`[${emb.join(',')}]`, item.id])
      } catch {}
    }

    // pgvector: for each wardrobe item find closest catalog item of a different clothing group
    const { rows } = await pool.query(`
      SELECT
        w.id              AS wardrobe_id,
        w.image_url       AS wardrobe_image_url,
        w.category        AS wardrobe_category,
        w.color           AS wardrobe_color,
        w.description     AS wardrobe_description,
        c.id              AS catalog_id,
        c.brand,
        c.name,
        c.category        AS catalog_category,
        c.color           AS catalog_color,
        c.price,
        c.image_url       AS catalog_image_url,
        c.store_url,
        c.style_tags,
        ROUND((1 - (c.embedding <=> w.embedding))::numeric * 100) AS similarity_score
      FROM wardrobe_items w
      CROSS JOIN LATERAL (
        SELECT * FROM catalog_items c
        WHERE c.embedding IS NOT NULL

          -- Gender filter: show unisex + items matching user's gender (or all if gender unknown)
          AND (c.gender = 'unisex' OR $1 = '' OR c.gender = $1)

          -- Must be a different clothing group
          AND (
            CASE WHEN LOWER(c.category) IN ('jeans','shorts','skirt','bottom','trousers','pants') THEN 'bottoms'
                 WHEN LOWER(c.category) IN ('top','shirt','blouse','tshirt','t-shirt','knitwear','sweater') THEN 'tops'
                 WHEN LOWER(c.category) IN ('dress') THEN 'dress'
                 WHEN LOWER(c.category) IN ('outerwear','jacket','coat','blazer') THEN 'outerwear'
                 WHEN LOWER(c.category) IN ('shoes','sneakers','boots','heels','sandals') THEN 'shoes'
                 ELSE LOWER(c.category) END
          ) != (
            CASE WHEN LOWER(w.category) IN ('jeans','shorts','skirt','bottom','trousers','pants') THEN 'bottoms'
                 WHEN LOWER(w.category) IN ('top','shirt','blouse','tshirt','t-shirt','knitwear','sweater') THEN 'tops'
                 WHEN LOWER(w.category) IN ('dress') THEN 'dress'
                 WHEN LOWER(w.category) IN ('outerwear','jacket','coat','blazer') THEN 'outerwear'
                 WHEN LOWER(w.category) IN ('shoes','sneakers','boots','heels','sandals') THEN 'shoes'
                 ELSE LOWER(w.category) END
          )

          -- Dress is a full outfit: only pair with outerwear or shoes, never tops/bottoms
          AND NOT (
            LOWER(w.category) = 'dress'
            AND LOWER(c.category) NOT IN ('outerwear','jacket','coat','blazer','shoes','sneakers','boots','heels','sandals')
          )
          AND NOT (
            LOWER(c.category) = 'dress'
            AND LOWER(w.category) NOT IN ('outerwear','jacket','coat','blazer','shoes','sneakers','boots','heels','sandals')
          )

          -- Skip same-color pairings (visual similarity pulls matching colors to the top)
          AND NOT (
            w.color != '' AND c.color != ''
            AND LOWER(w.color) = LOWER(c.color)
          )

        ORDER BY (c.embedding <=> w.embedding) + (RANDOM() * 0.18)
        LIMIT 15
      ) c
      WHERE w.embedding IS NOT NULL
      ORDER BY w.id, similarity_score DESC
    `, [userGender])

    // Group top-15 candidates by wardrobe item
    const grouped = new Map()
    for (const r of rows) {
      if (!grouped.has(r.wardrobe_id)) {
        grouped.set(r.wardrobe_id, { wardrobe: r, candidates: [] })
      }
      grouped.get(r.wardrobe_id).candidates.push(r)
    }

    // Groq reranking: run in parallel, fall back to top vector result on failure
    const reranked = await Promise.all(
      Array.from(grouped.values()).map(async ({ wardrobe, candidates }) => {
        let chosen = candidates[0]
        let styleReason = ''
        try {
          const wardrobeItem = {
            category: wardrobe.wardrobe_category,
            color: wardrobe.wardrobe_color || '',
            description: wardrobe.wardrobe_description || '',
          }
          const catalogCandidates = candidates.map(c => ({
            id: c.catalog_id,
            brand: c.brand,
            name: c.name,
            category: c.catalog_category,
            color: c.catalog_color || '',
          }))
          const { index, reason, styleScore } = await rankCandidates(wardrobeItem, catalogCandidates)
          chosen = candidates[index]
          styleReason = reason
          if (styleScore) chosen = { ...chosen, ai_style_score: styleScore }
        } catch (err) {
          console.error('Groq rerank failed, using top vector result:', err.message)
        }
        return { chosen, styleReason }
      })
    )

    // Build top-5 results: Groq-chosen picks first, then vector-similarity runners-up
    const seen = new Set()
    const results = []

    for (const { chosen, styleReason } of reranked) {
      if (!seen.has(chosen.catalog_id)) {
        seen.add(chosen.catalog_id)
        results.push({ chosen, styleReason })
      }
    }

    if (results.length < 8) {
      const runnerUps = []
      for (const { candidates } of grouped.values()) {
        for (const c of candidates) {
          if (!seen.has(c.catalog_id)) runnerUps.push(c)
        }
      }
      runnerUps.sort((a, b) => b.similarity_score - a.similarity_score)
      for (const c of runnerUps) {
        if (results.length >= 8) break
        if (!seen.has(c.catalog_id)) {
          seen.add(c.catalog_id)
          results.push({ chosen: c, styleReason: '' })
        }
      }
    }

    const recommendations = results.slice(0, 8).map(({ chosen: r, styleReason }) => ({
        wardrobe_item: {
          id: r.wardrobe_id,
          image_url: r.wardrobe_image_url,
          category: r.wardrobe_category,
          description: r.wardrobe_description,
        },
        catalog_item: {
          id: r.catalog_id,
          brand: r.brand,
          name: r.name,
          category: r.catalog_category,
          price: r.price,
          image_url: r.catalog_image_url,
          store_url: r.store_url,
          style_tags: r.style_tags,
        },
        similarity_score: r.ai_style_score ?? parseInt(r.similarity_score),
        style_reason: styleReason,
      }))

    res.json(recommendations)
  } catch (err) {
    console.error('Recommendations error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
