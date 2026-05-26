// Stylist + Critic. Two cooperating agents: the Stylist (vision) scores the
// pre-filtered candidate outfits while actually looking at the garments; the
// Critic (text) reviews those scores and selects the final top 2, with a written
// critique for the reasoning trace. The expensive vision pass runs once.
// Multimodal call helper — Crusoe-first (Nemotron), Groq fallback.
const { callJSON, img, txt, TEXT_MODEL, SCORING_RUBRIC } = require('../llm')

// Collect the distinct wardrobe items used across candidates (cap for token cost).
function distinctItems(candidates, cap = 10) {
  const seen = new Map()
  for (const c of candidates) {
    for (const it of c.items) if (!seen.has(it.id)) seen.set(it.id, it)
  }
  return [...seen.values()].slice(0, cap)
}

const itemDesc = (it) => `${it.description || it.category}${it.color ? ` (${it.color})` : ''}`

// Stylist agent (vision): score every candidate on the rubric.
async function scoreCandidates({ newItemUrl, newItemName, candidates }) {
  const items = distinctItems(candidates)
  const label = new Map(items.map((it, i) => [it.id, `W${i + 1}`]))

  const legend = items.map((it, i) => `W${i + 1}: ${itemDesc(it)}`).join('\n')
  const comboLines = candidates.map((c, i) =>
    `C${i + 1}: ${c.wardrobe_item_ids.map(id => label.get(id) || '?').filter(x => x !== '?').join(' + ')}`
  ).join('\n')

  const prompt = `You are a precise fashion stylist.
The FIRST image is the new item: "${newItemName}". The next ${items.length} images are wardrobe items, in this order:
${legend}

Candidate outfits (new item worn WITH these wardrobe pieces):
${comboLines}

${SCORING_RUBRIC}

Score EVERY candidate on color_harmony, formality_match, occasion (occasion_coherence), silhouette, and overall.
SPREAD the scores across candidates — if two candidates look broadly similar, the better one should score a point or two higher than the weaker one. Identical scores across different outfits are almost never correct.

Return ONLY valid JSON, no markdown:
{
  "scores": [
    { "candidate": "C1", "color_harmony": 0, "formality_match": 0, "occasion": 0, "silhouette": 0, "overall": 0, "name": "short occasion name", "styling_note": "one sentence — if any axis is low, NAME the weakness (e.g. 'the blue-on-blue is monotone; needs a contrast piece')" }
  ]
}`

  const content = [
    txt('Scoring outfit candidates. First image = new item; following images = wardrobe items in listed order.'),
    img(newItemUrl),
    ...items.map(it => img(it.image_url)),
    txt(prompt),
  ]

  const data = await callJSON({ content, maxTokens: 1200, temperature: 0.5, label: 'critic-score' })
  return Array.isArray(data.scores) ? data.scores : []
}

// Critic agent (text): review the stylist's scores and pick the final top 2.
async function critiqueAndSelect({ newItemName, candidates, scores, take = 2 }) {
  const byLabel = new Map(scores.map(s => [s.candidate, s]))
  const lines = candidates.map((c, i) => {
    const s = byLabel.get(`C${i + 1}`) || {}
    return `C${i + 1} [overall ${s.overall ?? '?'}]: ${c.items.map(itemDesc).join(' + ')} — heuristic ${c.score}/100; stylist note: ${s.styling_note || 'n/a'}`
  }).join('\n')

  const prompt = `You are a senior style critic reviewing a junior stylist's picks for the new item "${newItemName}".
Candidates with the stylist's overall scores and a deterministic heuristic score:
${lines}

Critique the strongest options in one or two sentences (call out any weak color or formality clashes), then choose the best ${take}. Prefer outfits that are both highly scored AND distinct from each other (don't pick two near-identical looks).
Return ONLY valid JSON, no markdown:
{
  "critique": "one or two sentences",
  "selected": [ { "candidate": "C1", "name": "short occasion name", "styling_note": "one polished sentence", "score": 0 } ]
}
"score" is 0-100.`

  const data = await callJSON({
    content: [txt(prompt)],
    model: TEXT_MODEL,
    maxTokens: 600,
    temperature: 0.4,
    label: 'critic-select',
  })
  return { critique: data.critique || '', selected: Array.isArray(data.selected) ? data.selected.slice(0, take) : [] }
}

// Orchestrated: score (vision) → critique+select (text) → resolve to candidates.
async function scoreAndSelect({ newItemUrl, newItemName, candidates, take = 2 }) {
  if (!candidates.length) return { selected: [], critique: '', scores: [] }

  const scores = await scoreCandidates({ newItemUrl, newItemName, candidates })
  const byLabel = new Map(scores.map(s => [s.candidate, s]))

  let finalCritique = ''
  let chosen
  try {
    const { critique, selected } = await critiqueAndSelect({ newItemName, candidates, scores, take })
    finalCritique = critique
    chosen = selected
  } catch {
    chosen = [] // fall back to heuristic ranking below
  }

  // Map the critic's choices back onto real candidate objects; fall back to the
  // heuristic order if the critic returned nothing usable.
  const indexOf = (cand) => parseInt(String(cand).replace(/[^0-9]/g, ''), 10) - 1
  let picks = chosen
    .map(sel => ({ sel, cand: candidates[indexOf(sel.candidate)] }))
    .filter(p => p.cand)

  if (!picks.length) picks = candidates.slice(0, take).map((cand, i) => ({ sel: byLabel.get(`C${i + 1}`) || {}, cand }))

  const selected = picks.slice(0, take).map(({ sel, cand }, i) => {
    const stylist = byLabel.get(`C${candidates.indexOf(cand) + 1}`) || {}
    return {
      ...cand,
      name: sel.name || stylist.name || `Look ${i + 1}`,
      styling_note: sel.styling_note || stylist.styling_note || '',
      score: sel.score || Math.round((stylist.overall || cand.score / 10) * 10),
      score_breakdown: {
        color_harmony: stylist.color_harmony,
        formality_match: stylist.formality_match,
        occasion: stylist.occasion,
        silhouette: stylist.silhouette,
      },
    }
  })

  return { selected, critique: finalCritique, scores }
}

module.exports = { scoreAndSelect }
