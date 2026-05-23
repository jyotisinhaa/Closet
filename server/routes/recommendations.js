const express = require('express')
const pool    = require('../db/client')
const { getImageEmbedding } = require('../services/fashionclip')

const router = express.Router()

// GET /api/catalog
router.get('/catalog', async (req, res) => {
  const { rows } = await pool.query('SELECT id, brand, name, category, color, price, store_url, image_url, style_tags, sponsored, added_at FROM catalog_items ORDER BY added_at DESC')
  res.json(rows)
})

// POST /api/catalog
router.post('/catalog', async (req, res) => {
  const { brand, name, category, color, price, store_url, image_url, style_tags } = req.body
  if (!image_url || !category) return res.status(400).json({ error: 'image_url and category required' })

  let embedding = null
  try {
    embedding = await getImageEmbedding(image_url)
  } catch (err) {
    console.error('Embedding failed:', err.message)
  }

  const { rows } = await pool.query(
    `INSERT INTO catalog_items (brand, name, category, color, price, store_url, image_url, style_tags, sponsored, embedding)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,$9) RETURNING *`,
    [brand || 'Unknown', name || category, category, color || '', parseFloat(price) || 0, store_url || '', image_url, style_tags || [], embedding ? `[${embedding.join(',')}]` : null]
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
        w.description     AS wardrobe_description,
        c.id              AS catalog_id,
        c.brand,
        c.name,
        c.category        AS catalog_category,
        c.price,
        c.image_url       AS catalog_image_url,
        c.store_url,
        c.style_tags,
        ROUND((1 - (c.embedding <=> w.embedding))::numeric * 100) AS similarity_score
      FROM wardrobe_items w
      CROSS JOIN LATERAL (
        SELECT * FROM catalog_items c
        WHERE c.embedding IS NOT NULL
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
        ORDER BY c.embedding <=> w.embedding
        LIMIT 1
      ) c
      WHERE w.embedding IS NOT NULL
      ORDER BY similarity_score DESC
    `)

    // Deduplicate: each catalog item appears only once
    const seen = new Set()
    const unique = rows.filter(r => {
      if (seen.has(r.catalog_id)) return false
      seen.add(r.catalog_id)
      return true
    })

    const recommendations = unique.map(r => ({
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
      similarity_score: parseInt(r.similarity_score),
    }))

    res.json(recommendations)
  } catch (err) {
    console.error('Recommendations error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
