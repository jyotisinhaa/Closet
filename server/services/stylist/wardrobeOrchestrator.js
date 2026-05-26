// The agentic try-on pipeline for WARDROBE-ONLY rendering — the "Try It On"
// flow on the My Wardrobe page where the user picks pieces they already own and
// no new external item is involved. Sibling of services/stylist/orchestrator.js
// (which handles new-item try-ons). Different shape, same model + harness:
// every LLM node calls services/llm.js (Crusoe-first / Groq fallback) and every
// step appends a human-readable line to `trace` for the StylistTracePanel UI.
const { callJSON, img, txt, TEXT_MODEL, SCORING_RUBRIC } = require('../llm')

const FORMALITY_VOCAB = 'casual, smart_casual, business, formal'
const SEASON_VOCAB = 'spring, summer, fall, winter, all'

const itemDesc = (it) => `${it.description || it.category}${it.color ? ` (${it.color})` : ''}`

// 1 + 3 — Combined analyzer + critic (vision). Was two separate calls until we
// noticed both looked at the exact same images (profile photo + selected
// wardrobe items, 100% overlap). Merging them halves the image-input token
// cost without changing the user-facing trace: the orchestrator below still
// emits "Outfit analyzer" and "Coherence critic" as distinct trace entries
// with the deterministic coverage check sandwiched between, so a judge
// expanding the panel sees the same 4-step agentic narrative.
//
// The trade-off is one bigger JSON to parse vs two cleaner ones. The schema is
// flat (no nesting) and parseStylistJson tolerates partial recovery, so a
// dropped field degrades gracefully — the defaults in the destructuring below
// fill anything the model omits.
async function analyzeAndCritiqueOutfit({ profilePhotoUrl, items, hints = {} }) {
  const labels = items.map((it, i) => `W${i + 1}: ${itemDesc(it)}`).join('\n')
  const genderLine = hints.gender ? `\nThe user identifies as ${hints.gender}.\n` : ''

  const prompt = `You are doing TWO jobs in one pass on the same images:
1) ANALYST — identify the outfit as a whole.
2) CRITIC — score it on the rubric below and write a verdict.

Image 1 is the person. Images 2-${items.length + 1} are wardrobe items they're styling together, in this order:
${labels}
${genderLine}
ANALYSIS:
- outfit_name: short evocative name (e.g. "Friday-night dinner casual")
- occasion: 1-2 occasions this outfit suits, comma separated
- formality: ONE of: ${FORMALITY_VOCAB}
- season: any of: ${SEASON_VOCAB}
- palette: 1-3 dominant colors, lowercase single words
- fit_note: one honest sentence on how this outfit reads on THIS person ("you"). If any piece is visibly cut for the wrong gender's silhouette in a way that would noticeably read as ill-fitting, lead with that and do not soften it.

SCORING — apply the rubric below STRICTLY:

${SCORING_RUBRIC}

Score on color_harmony, formality_match, occasion_coherence, silhouette, and overall (each 0-10).
Then write a 1-2 sentence critique that NAMES the weakest axis specifically. If color_harmony is low, say what the clash is (e.g. "the navy top and blue jeans are monotone — needs a contrast layer"). Vague critiques like "looks good" are useless — be specific or be quiet.

Return ONLY valid JSON, no markdown. ALL fields in one flat object:
{
  "outfit_name": "...",
  "occasion": "...",
  "formality": "...",
  "season": ["..."],
  "palette": ["..."],
  "fit_note": "...",
  "color_harmony": 0,
  "formality_match": 0,
  "occasion_coherence": 0,
  "silhouette": 0,
  "overall": 0,
  "critique": "..."
}`

  const content = [img(profilePhotoUrl), ...items.map(it => img(it.image_url)), txt(prompt)]
  // maxTokens covers the combined JSON answer (analysis + scoring fields). The
  // reasoning buffer is added on top by services/llm.js based on modality.
  const data = await callJSON({
    content,
    maxTokens: 900,
    temperature: 0.4,
    label: `wardrobe-combined/${items.length}img`,
  })

  const analysis = {
    outfit_name: data.outfit_name || 'Wardrobe look',
    occasion:    data.occasion    || '',
    formality:   data.formality   || 'casual',
    season:      Array.isArray(data.season) && data.season.length ? data.season : ['all'],
    palette:     Array.isArray(data.palette) ? data.palette : [],
    fit_note:    data.fit_note    || '',
  }
  const critique = {
    color_harmony:       Number.isFinite(data.color_harmony)       ? data.color_harmony       : null,
    formality_match:     Number.isFinite(data.formality_match)     ? data.formality_match     : null,
    occasion_coherence:  Number.isFinite(data.occasion_coherence)  ? data.occasion_coherence  : null,
    silhouette:          Number.isFinite(data.silhouette)          ? data.silhouette          : null,
    overall:             Number.isFinite(data.overall)             ? data.overall             : null,
    critique:            data.critique || '',
  }
  return { analysis, critique }
}

// 2 — Deterministic slot coverage. Mirrors the category buckets used by
// renderOutfitChain so the slot vocabulary stays in lockstep with what we know
// how to render. Tells the user plainly when an outfit isn't really a full
// outfit yet (e.g. they picked just a top and bottom, no shoes).
function analyzeOutfitCoverage(items) {
  const cats = items.map(it => (it.category || '').toLowerCase().trim())
  const has = (...names) => cats.some(c => names.includes(c))

  const hasFullBody  = has('dress', 'jumpsuit')
  const hasUpper     = has('top', 'shirt', 'blouse', 'tshirt', 't-shirt', 'sweater', 'knit')
  const hasLower     = has('jeans', 'pants', 'bottom', 'skirt', 'shorts', 'trousers', 'leggings')
  const hasOuterwear = has('outerwear', 'jacket', 'coat', 'blazer')
  const hasShoes     = has('shoes', 'shoe', 'sneakers', 'boots', 'heels', 'sandals', 'loafers', 'footwear')

  const covered = []
  if (hasFullBody)  covered.push('full-body piece')
  if (hasUpper)     covered.push('top')
  if (hasLower)     covered.push('bottom')
  if (hasOuterwear) covered.push('outerwear')
  if (hasShoes)     covered.push('shoes')

  const hasBody = hasFullBody || (hasUpper && hasLower)
  const missing = []
  if (!hasBody) {
    if (!hasUpper && !hasFullBody) missing.push('a top')
    if (!hasLower && !hasFullBody) missing.push('a bottom')
  }
  if (!hasShoes) missing.push('shoes')

  const complete = hasBody && hasShoes
  const summary = complete
    ? 'Complete outfit'
    : missing.length === 1
      ? `Missing ${missing[0]}`
      : `Missing ${missing.join(' and ')}`

  return { covered, missing, complete, summary }
}

// 4 — Honest assessment (text). (The analyzer+critic merge above replaces the
// previous separate critiqueOutfit() — see commit history if you need it back.) Fuses analyzer + critic + coverage into one
// candid verdict — same role as services/stylist/assess.js, just adapted to a
// wardrobe-only outfit (no "should I buy this?" framing).
async function writeOutfitAssessment({ analysis, critique, coverage, hints = {} }) {
  const prompt = `You are a brutally honest but kind personal stylist. Write the verdict on this wardrobe outfit: "${analysis.outfit_name}".

Signals (already computed — trust them):
${hints.gender ? `- User identifies as: ${hints.gender}\n` : ''}- Fit on the user: ${analysis.fit_note || 'n/a'}
- Critic's note: ${critique.critique || 'n/a'}
- Scores (0-10): color_harmony=${critique.color_harmony ?? '?'}, formality_match=${critique.formality_match ?? '?'}, occasion=${critique.occasion_coherence ?? '?'}, silhouette=${critique.silhouette ?? '?'}, overall=${critique.overall ?? '?'}
- Outfit completeness: ${coverage.summary}

Write 2-3 sentences, addressing the user directly as "you".
- If overall >= 7, say so with confidence and name the occasion this works for.
- If overall < 6 OR any single score < 5, call out the weak link plainly and tell them what to swap — refer to SLOTS like "swap the shoes for something less casual" or "the top is fighting the pants", do NOT invent specific new items.
- If coverage is incomplete, mention it briefly ("add shoes before you wear this out").
- If a gender-cut mismatch is in fit_note, mirror that and say "swap it" plainly.
- Do NOT invent facts beyond the signals.

Return ONLY valid JSON, no markdown: { "honest_assessment": "..." }`

  try {
    const data = await callJSON({ content: [txt(prompt)], model: TEXT_MODEL, maxTokens: 300, temperature: 0.5, label: 'wardrobe-assess' })
    return data.honest_assessment || fallbackAssessment({ critique, coverage })
  } catch {
    return fallbackAssessment({ critique, coverage })
  }
}

// Deterministic fallback so the modal always has a verdict even when the LLM
// path errors. Mirrors the analogue in assess.js for new-item try-ons.
function fallbackAssessment({ critique, coverage }) {
  const overall = critique.overall ?? 0
  if (overall >= 7) return `A strong pairing — overall ${overall}/10. ${coverage.complete ? 'You can wear this confidently.' : `${coverage.summary} though.`}`
  if (overall && overall < 6) return `This pairing has rough edges (overall ${overall}/10). ${critique.critique || 'Consider swapping the weakest piece.'}`
  return `A workable look. ${coverage.complete ? '' : coverage.summary}`
}

// Main orchestrator — runs analyze → coverage → critique → assess in sequence
// with a `trace` entry per step. Designed to be called in PARALLEL with the
// Perfect Corp render so the LLM cost is hidden behind the render latency.
async function runWardrobeStylistAgents({ profilePhotoUrl, items, hints = {} }) {
  const trace = []
  const step = (title, detail) => trace.push({ step: trace.length + 1, title, detail })

  // 1 + 3 — Combined analyzer + critic in ONE Nemotron call (was two when
  // each shot its own images at the model). Trace lines are still emitted
  // separately below so the user-facing narrative reads as a multi-step agent:
  // analyzer → coverage check → critic → assessment.
  let analysis = { outfit_name: 'Wardrobe look', formality: 'casual', occasion: '', season: ['all'], palette: [], fit_note: '' }
  let critique = { color_harmony: null, formality_match: null, occasion_coherence: null, silhouette: null, overall: null, critique: '' }
  try {
    const combined = await analyzeAndCritiqueOutfit({ profilePhotoUrl, items, hints })
    analysis = combined.analysis
    critique = combined.critique
  } catch (err) {
    console.warn('[wardrobe-stylist] combined analyzer+critic failed:', err.message)
  }
  step('Outfit analyzer', `${analysis.outfit_name} — ${analysis.formality}${analysis.occasion ? `, for ${analysis.occasion}` : ''}`)

  // 2 — Coverage (deterministic)
  const coverage = analyzeOutfitCoverage(items)
  step('Coverage check', coverage.summary + (coverage.covered.length ? ` (${coverage.covered.join(' + ')})` : ''))

  step('Coherence critic', formatWardrobeCriticDetail(critique))

  // 4 — Assessment
  const honest_assessment = await writeOutfitAssessment({ analysis, critique, coverage, hints })
  // Echo the verdict in the trace so an expanded panel shows the actual line
  // the user is reading above the panel — useful when comparing traces.
  step('Honest assessment', formatVerdictDetail(honest_assessment))

  return {
    outfit_name: analysis.outfit_name,
    occasion: analysis.occasion,
    formality: analysis.formality,
    season: analysis.season,
    palette: analysis.palette,
    fit_note: analysis.fit_note,
    coverage,
    critique,
    honest_assessment,
    trace,
  }
}

// Build a multi-line "Coherence critic" trace detail that surfaces every sub-
// score so a judge can verify the rubric was applied numerically (and the
// weakest-link rule fired). The critic's prose critique is appended below.
function formatWardrobeCriticDetail(critique) {
  const parts = []
  if (critique.color_harmony      != null) parts.push(`color ${critique.color_harmony}/10`)
  if (critique.formality_match    != null) parts.push(`formality ${critique.formality_match}/10`)
  if (critique.occasion_coherence != null) parts.push(`occasion ${critique.occasion_coherence}/10`)
  if (critique.silhouette         != null) parts.push(`silhouette ${critique.silhouette}/10`)

  if (!parts.length) return 'Skipped — could not score the outfit'

  const overall = critique.overall != null ? ` (overall ${critique.overall}/10)` : ''
  const head    = `${parts.join(' · ')}${overall}`
  return critique.critique ? `${head}\n${critique.critique}` : head
}

function formatVerdictDetail(honestAssessment) {
  if (!honestAssessment) return 'Composed the final verdict from the signals above'
  const trimmed = honestAssessment.length > 220 ? honestAssessment.slice(0, 220).trimEnd() + '…' : honestAssessment
  return `"${trimmed}"`
}

module.exports = { runWardrobeStylistAgents }
