// Deterministic styling "tools" — no API calls. These prune and rank the
// wardrobe so the LLM agents only ever reason over a small, sensible candidate
// set (retrieve-then-rerank). Everything here is pure and unit-testable.

// --- Vocabulary ------------------------------------------------------------

// Canonical slots an outfit is built from. Bag/accessory are tracked for gap
// analysis but never rendered (Perfect Corp only does upper/lower/full/shoes).
const SLOT = {
  TOP: 'top', BOTTOM: 'bottom', DRESS: 'dress',
  OUTERWEAR: 'outerwear', SHOES: 'shoes', BAG: 'bag', ACCESSORY: 'accessory',
}

const RENDERABLE_SLOTS = [SLOT.TOP, SLOT.BOTTOM, SLOT.DRESS, SLOT.OUTERWEAR, SLOT.SHOES]

// Maps the app's free-ish category labels (see app/src/lib/categories.js and the
// vision tagger output) onto canonical slots.
const CATEGORY_TO_SLOT = {
  top: SLOT.TOP, shirt: SLOT.TOP, blouse: SLOT.TOP, tshirt: SLOT.TOP, 't-shirt': SLOT.TOP, tee: SLOT.TOP, sweater: SLOT.TOP, knit: SLOT.TOP,
  jeans: SLOT.BOTTOM, bottom: SLOT.BOTTOM, pants: SLOT.BOTTOM, trousers: SLOT.BOTTOM, shorts: SLOT.BOTTOM, skirt: SLOT.BOTTOM,
  dress: SLOT.DRESS, gown: SLOT.DRESS,
  outerwear: SLOT.OUTERWEAR, jacket: SLOT.OUTERWEAR, coat: SLOT.OUTERWEAR, blazer: SLOT.OUTERWEAR, cardigan: SLOT.OUTERWEAR,
  shoes: SLOT.SHOES, sneakers: SLOT.SHOES, boots: SLOT.SHOES, heels: SLOT.SHOES, sandals: SLOT.SHOES,
  bag: SLOT.BAG, purse: SLOT.BAG, handbag: SLOT.BAG,
  accessory: SLOT.ACCESSORY, hat: SLOT.ACCESSORY, scarf: SLOT.ACCESSORY, belt: SLOT.ACCESSORY,
}

const SLOT_LABEL = {
  [SLOT.TOP]: 'top', [SLOT.BOTTOM]: 'bottom', [SLOT.DRESS]: 'dress',
  [SLOT.OUTERWEAR]: 'jacket', [SLOT.SHOES]: 'pair of shoes',
  [SLOT.BAG]: 'bag', [SLOT.ACCESSORY]: 'accessory',
}

function pluralLabel(slot, n) {
  const label = SLOT_LABEL[slot] || slot
  if (n === 1) return label
  if (slot === SLOT.SHOES) return 'pairs of shoes'
  return `${label}s`
}

function canonicalSlot(category) {
  if (!category) return null
  return CATEGORY_TO_SLOT[String(category).toLowerCase().trim()] || null
}

// What an outfit needs alongside a given new-item slot. `requiredSets` is a list
// of alternative slot combinations (any one fully-satisfiable set is valid).
function complementRequirements(slot) {
  switch (slot) {
    case SLOT.TOP:       return { requiredSets: [[SLOT.BOTTOM, SLOT.SHOES]], optional: [SLOT.OUTERWEAR] }
    case SLOT.BOTTOM:    return { requiredSets: [[SLOT.TOP, SLOT.SHOES]], optional: [SLOT.OUTERWEAR] }
    case SLOT.DRESS:     return { requiredSets: [[SLOT.SHOES]], optional: [SLOT.OUTERWEAR] }
    case SLOT.OUTERWEAR: return { requiredSets: [[SLOT.TOP, SLOT.BOTTOM, SLOT.SHOES], [SLOT.DRESS, SLOT.SHOES]], optional: [] }
    case SLOT.SHOES:     return { requiredSets: [[SLOT.TOP, SLOT.BOTTOM], [SLOT.DRESS]], optional: [SLOT.OUTERWEAR] }
    case SLOT.BAG:
    case SLOT.ACCESSORY: return { requiredSets: [[SLOT.TOP, SLOT.BOTTOM, SLOT.SHOES], [SLOT.DRESS, SLOT.SHOES]], optional: [SLOT.OUTERWEAR] }
    default:             return { requiredSets: [], optional: [] }
  }
}

// Union of every slot that can complement the new-item slot (required + optional).
function complementSlots(slot) {
  const { requiredSets, optional } = complementRequirements(slot)
  const set = new Set(optional)
  requiredSets.forEach(s => s.forEach(x => set.add(x)))
  return set
}

// --- Compatibility heuristics (0..1) ---------------------------------------

const NEUTRALS = new Set([
  'black', 'white', 'grey', 'gray', 'beige', 'cream', 'tan', 'navy', 'denim',
  'brown', 'khaki', 'charcoal', 'ivory', 'camel', 'stone', 'taupe', 'nude',
])

const norm = (arr) => (Array.isArray(arr) ? arr.map(x => String(x).toLowerCase().trim()).filter(Boolean) : [])

function jaccard(a, b) {
  const A = new Set(norm(a)), B = new Set(norm(b))
  if (A.size === 0 && B.size === 0) return 0
  let inter = 0
  for (const x of A) if (B.has(x)) inter++
  return inter / (A.size + B.size - inter)
}

function colorHarmony(paletteA, paletteB) {
  const a = norm(paletteA), b = norm(paletteB)
  if (a.length === 0 || b.length === 0) return 0.7 // unknown — assume wearable
  const shares = a.some(x => b.includes(x))
  if (shares) return 0.9
  if (a.some(x => NEUTRALS.has(x)) || b.some(x => NEUTRALS.has(x))) return 0.8
  return 0.6 // two distinct non-neutrals — let the LLM critic make the call
}

const FORMALITY_RANK = { casual: 0, smart_casual: 1, business: 2, formal: 3 }
function formalityMatch(a, b) {
  const ra = FORMALITY_RANK[String(a).toLowerCase()] ?? 0
  const rb = FORMALITY_RANK[String(b).toLowerCase()] ?? 0
  return 1 - Math.abs(ra - rb) / 3
}

function seasonOverlap(a, b) {
  const A = norm(a), B = norm(b)
  if (A.length === 0 || B.length === 0 || A.includes('all') || B.includes('all')) return 1
  return A.some(x => B.includes(x)) ? 1 : 0.5
}

// Single combined pairing score between the new item and one wardrobe item.
function pairScore(newItem, item) {
  const color    = colorHarmony(newItem.palette, item.palette)
  const formal   = formalityMatch(newItem.formality, item.formality)
  const season   = seasonOverlap(newItem.season, item.season)
  const total    = 0.45 * color + 0.35 * formal + 0.20 * season
  return { total, color, formal, season }
}

// --- Tools -----------------------------------------------------------------

function groupRenderableBySlot(wardrobe) {
  const bySlot = {}
  for (const item of wardrobe) {
    const slot = canonicalSlot(item.category)
    if (!RENDERABLE_SLOTS.includes(slot)) continue
    ;(bySlot[slot] ||= []).push(item)
  }
  return bySlot
}

function cartesian(lists) {
  return lists.reduce((acc, list) => acc.flatMap(combo => list.map(item => [...combo, item])), [[]])
}

// #2 — generate valid, pre-filtered, pre-ranked candidate outfits. Each combo
// references real wardrobe items in complementary slots (max 3 items so the
// Perfect Corp render chain stays valid). Capped so the LLM input stays small.
function generateCandidates(newItem, wardrobe, { limit = 10, perSlotTopK = 3 } = {}) {
  const slot = canonicalSlot(newItem.category)
  if (!slot) return []

  const { requiredSets, optional } = complementRequirements(slot)
  const bySlot = groupRenderableBySlot(wardrobe)

  // Top-K items per slot by individual pairing score with the new item.
  const topPerSlot = {}
  for (const s of Object.keys(bySlot)) {
    topPerSlot[s] = bySlot[s]
      .map(it => ({ it, score: pairScore(newItem, it).total }))
      .sort((x, y) => y.score - x.score)
      .slice(0, perSlotTopK)
  }

  const combos = []
  for (const reqSet of requiredSets) {
    if (reqSet.some(s => !topPerSlot[s]?.length)) continue // can't satisfy this set
    for (const picks of cartesian(reqSet.map(s => topPerSlot[s]))) {
      let items = picks.map(p => p.it)
      // Add the best optional item (e.g. outerwear) if it harmonizes and we have room.
      for (const optSlot of optional) {
        if (items.length >= 3) break
        const best = topPerSlot[optSlot]?.[0]
        if (best && best.score >= 0.65) items = [...items, best.it]
      }
      combos.push(items)
    }
  }

  // Deduplicate by item-id set, score by average pairing strength, rank, cap.
  const seen = new Set()
  const scored = []
  for (const items of combos) {
    const ids = items.map(i => i.id).sort()
    const key = ids.join('|')
    if (seen.has(key)) continue
    seen.add(key)
    const score = items.reduce((sum, it) => sum + pairScore(newItem, it).total, 0) / items.length
    scored.push({ wardrobe_item_ids: items.map(i => i.id), items, score: Math.round(score * 100) })
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit)
}

// #1 — items already owned that are similar to the new one (same slot + overlap).
function findDuplicates(newItem, wardrobe, { threshold = 0.5 } = {}) {
  const slot = canonicalSlot(newItem.category)
  const newCat = String(newItem.category || '').toLowerCase().trim()

  const matches = wardrobe
    .filter(it => canonicalSlot(it.category) === slot && slot)
    .map(it => {
      const tagSim   = jaccard(newItem.style_tags, it.style_tags)
      const colorSim = jaccard(newItem.palette, it.palette)
      const sameCat  = String(it.category || '').toLowerCase().trim() === newCat ? 1 : 0
      const sim = 0.5 * tagSim + 0.3 * colorSim + 0.2 * sameCat
      return { item: it, similarity: Math.round(sim * 100) }
    })
    .filter(m => m.similarity >= threshold * 100)
    .sort((a, b) => b.similarity - a.similarity)

  const count = matches.length
  const summary = count === 0 ? 'none' : `${count} similar ${pluralLabel(slot, count)}`
  return { items: matches, count, summary }
}

// Cost-per-wear / versatility — how many owned items pair well with the new one.
function computeVersatility(newItem, wardrobe, { threshold = 0.6 } = {}) {
  const slot = canonicalSlot(newItem.category)
  const comp = complementSlots(slot)
  const candidates = wardrobe.filter(it => comp.has(canonicalSlot(it.category)))

  const matches = candidates
    .map(it => ({ it, score: pairScore(newItem, it).total }))
    .filter(m => m.score >= threshold)
    .sort((a, b) => b.score - a.score)

  const count = matches.length
  const score = candidates.length ? Math.round((count / candidates.length) * 100) : 0
  const examples = matches.slice(0, 3).map(m => m.it.description || m.it.category)
  return { count, score, total: candidates.length, examples }
}

// Wardrobe gap — does the new item fill an under-represented slot or pile on?
function analyzeGap(wardrobe, newItem) {
  const counts = {}
  for (const it of wardrobe) {
    const s = canonicalSlot(it.category)
    if (s) counts[s] = (counts[s] || 0) + 1
  }

  const newSlot = canonicalSlot(newItem.category)
  const newSlotCount = counts[newSlot] || 0
  const fills_gap = newSlotCount <= 1

  const present = RENDERABLE_SLOTS.map(s => ({ slot: s, c: counts[s] || 0 })).filter(x => x.c > 0)
  let summary
  if (present.length < 2) {
    summary = 'Your wardrobe is still small, so most additions earn their place.'
  } else {
    const most = present.reduce((a, b) => (b.c > a.c ? b : a))
    summary = fills_gap
      ? `You own ${newSlotCount} ${pluralLabel(newSlot, newSlotCount)} — this fills a real gap, while your ${pluralLabel(most.slot, most.c)} are well covered (${most.c}).`
      : `You already own ${newSlotCount} ${pluralLabel(newSlot, newSlotCount)}; that part of your closet is well stocked.`
  }
  return { counts, fills_gap, newSlotCount, summary }
}

module.exports = {
  SLOT, RENDERABLE_SLOTS, SLOT_LABEL,
  canonicalSlot, complementRequirements, complementSlots,
  colorHarmony, formalityMatch, seasonOverlap, pairScore, jaccard,
  generateCandidates, findDuplicates, computeVersatility, analyzeGap,
}
