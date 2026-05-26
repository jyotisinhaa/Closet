// Wardrobe-item style classification + the rollup that turns per-item tags into
// the user's aggregate style profile (counts + top-N prefs). The classifier
// runs on Crusoe/Nemotron with a Groq fallback so a missing/transient CRUSOE
// key never blocks a wardrobe add.
const pool = require('../db/client')
const { isCrusoeEnabled, classifyItemWithCrusoe } = require('./crusoe')
const { classifyItemWithGroq } = require('./groq')

// Canonical 8-tag vocabulary. Must match STYLE_LABELS in
// app/src/features/profile/Profile.jsx — the radar chart, style score, and
// style-tip copy all key off these. Anything else the model invents is dropped.
const STYLE_VOCAB = ['casual', 'formal', 'minimalist', 'bohemian', 'streetwear', 'romantic', 'sporty', 'classic']

const TOP_PREFS_COUNT = 3

function normalizeTags(tags) {
  const allowed = new Set(STYLE_VOCAB)
  const seen = new Set()
  const out = []
  for (const t of tags || []) {
    const k = String(t).toLowerCase().trim()
    if (allowed.has(k) && !seen.has(k)) {
      seen.add(k)
      out.push(k)
    }
  }
  return out
}

// Call the classifier with a Crusoe → Groq fallback. Returns a normalized array
// of tags (possibly empty if both providers fail or the response was unusable).
async function classifyItem({ imageUrl, category, color, description }) {
  const args = { imageUrl, category, color, description }
  let result = null

  if (isCrusoeEnabled()) {
    try {
      result = await classifyItemWithCrusoe(args)
    } catch (err) {
      console.warn('[styleProfile] Crusoe classify failed, falling back to Groq:', err.message)
    }
  }
  if (!result) {
    try {
      result = await classifyItemWithGroq(args)
    } catch (err) {
      console.warn('[styleProfile] Groq classify failed:', err.message)
      return []
    }
  }
  return normalizeTags(result.style_tags)
}

// Recompute profile.style_profile (counts) and profile.style_prefs (top N tags)
// from every wardrobe item's style_tags. Called after each add/delete. Upserts
// the profile row so it works even before onboarding has run.
async function recomputeProfileStyle() {
  const { rows } = await pool.query(
    `SELECT style_tags FROM wardrobe_items WHERE style_tags IS NOT NULL AND array_length(style_tags, 1) > 0`,
  )
  const counts = {}
  for (const r of rows) for (const t of r.style_tags) counts[t] = (counts[t] || 0) + 1

  // Top-N by count, alphabetical tiebreak so the order is stable across calls.
  const prefs = Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, TOP_PREFS_COUNT)
    .map(([k]) => k)

  await pool.query(
    `INSERT INTO profile (id, style_profile, style_prefs)
     VALUES ('demo-user-1', $1::jsonb, $2)
     ON CONFLICT (id) DO UPDATE SET
       style_profile = $1::jsonb,
       style_prefs   = $2,
       updated_at    = NOW()`,
    [JSON.stringify(counts), prefs],
  )
  return { counts, prefs }
}

// Classify one item and refresh the aggregate. Designed for fire-and-forget:
// errors are swallowed (and logged) so an LLM hiccup never breaks the wardrobe
// add path. `item` is the row that was just inserted.
async function classifyAndRollup(item) {
  try {
    const tags = await classifyItem({
      imageUrl: item.image_url,
      category: item.category,
      color: item.color,
      description: item.description,
    })
    if (tags.length === 0) return
    await pool.query('UPDATE wardrobe_items SET style_tags = $1 WHERE id = $2', [tags, item.id])
    await recomputeProfileStyle()
  } catch (err) {
    console.error('[styleProfile] classifyAndRollup failed:', err.message)
  }
}

module.exports = {
  STYLE_VOCAB,
  normalizeTags,
  classifyItem,
  classifyAndRollup,
  recomputeProfileStyle,
}
