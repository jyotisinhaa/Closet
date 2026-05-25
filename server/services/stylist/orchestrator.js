// The agentic try-on pipeline. Deterministic orchestration (reliable for a live
// demo), but each reasoning node is a focused agent and the candidate search is
// done by deterministic tools so the LLM only reranks a small set. Every step
// appends a human-readable line to `trace` for the reasoning-trace UI.
const styleRules = require('../../lib/styleRules')
const { analyzeNewItem } = require('./analyze')
const { scoreAndSelect } = require('./critic')
const { writeAssessment } = require('./assess')

async function runStylistAgents({ newItemUrl, profilePhotoUrl, wardrobe = [], hints = {} }) {
  const trace = []
  const step = (title, detail) => trace.push({ step: trace.length + 1, title, detail })

  // 1 — Analyzer agent (vision)
  let meta
  try {
    meta = await analyzeNewItem({ newItemUrl, profilePhotoUrl, hints })
  } catch (err) {
    meta = {
      item_name: '', fit_note: '', category: hints.category || 'Top', color: hints.color || '',
      palette: hints.color ? [hints.color] : [], formality: 'casual', season: ['all'], pattern: 'solid', style_tags: [],
    }
  }
  step('Analyzer', meta.item_name
    ? `Identified "${meta.item_name}" — ${meta.category}, ${meta.formality}${meta.style_tags.length ? `, ${meta.style_tags.join('/')}` : ''}`
    : `Analyzed the new ${meta.category}`)

  // 2 — Duplicate-checker (tool)
  const duplicates = styleRules.findDuplicates(meta, wardrobe)
  step('Duplicate check', duplicates.count
    ? `Found ${duplicates.summary}: ${duplicates.items.slice(0, 3).map(d => d.item.description || d.item.category).join(', ')}`
    : 'No similar items already in your wardrobe')

  // 3 — Candidate generator (tool)
  const candidates = styleRules.generateCandidates(meta, wardrobe)
  const complementCount = wardrobe.filter(it => styleRules.complementSlots(styleRules.canonicalSlot(meta.category)).has(styleRules.canonicalSlot(it.category))).length
  step('Candidate search', candidates.length
    ? `Built ${candidates.length} valid outfits from ${complementCount} complementary wardrobe pieces`
    : 'No complete outfit can be formed from your current wardrobe yet')

  // 4 — Stylist + Critic (vision + text)
  let selected = [], critique = ''
  if (candidates.length) {
    try {
      const result = await scoreAndSelect({ newItemUrl, newItemName: meta.item_name || meta.category, candidates })
      selected = result.selected
      critique = result.critique
    } catch (err) {
      selected = candidates.slice(0, 2).map((c, i) => ({ ...c, name: `Look ${i + 1}`, styling_note: '', score: c.score, score_breakdown: {} }))
    }
  }
  step('Stylist + Critic', selected.length
    ? (critique || `Scored ${candidates.length} candidates; selected the top ${selected.length}`)
    : 'Skipped scoring — no candidates to rank')

  // 5 — Versatility scorer (tool)
  const versatility = styleRules.computeVersatility(meta, wardrobe)
  step('Versatility', `Pairs with ${versatility.count} of ${versatility.total} relevant items you own (${versatility.score}/100)`)

  // 6 — Gap analyzer (tool)
  const gap = styleRules.analyzeGap(wardrobe, meta)
  step('Gap analysis', gap.summary)

  // 7 — Assessment agent (text)
  const honest_assessment = await writeAssessment({ itemName: meta.item_name || meta.category, fitNote: meta.fit_note, duplicates, versatility, gap })
  step('Honest assessment', 'Composed the final verdict from the signals above')

  return {
    item_name: meta.item_name,
    detected_category: meta.category,
    color: meta.color,
    palette: meta.palette,
    formality: meta.formality,
    season: meta.season,
    pattern: meta.pattern,
    style_tags: meta.style_tags,
    fit_note: meta.fit_note,
    similar_owned: duplicates.summary,
    duplicates: {
      count: duplicates.count,
      items: duplicates.items.slice(0, 4).map(d => ({
        id: d.item.id, description: d.item.description || d.item.category, similarity: d.similarity, image_url: d.item.image_url,
      })),
    },
    versatility,
    gap: { fills_gap: gap.fills_gap, summary: gap.summary, counts: gap.counts },
    honest_assessment,
    critique,
    combinations: selected, // each: { name, styling_note, score, score_breakdown, wardrobe_item_ids, items }
    trace,
  }
}

module.exports = { runStylistAgents }
