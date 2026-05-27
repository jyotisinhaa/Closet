// Provider-agnostic JSON-returning chat call used by the multi-step stylist
// orchestrator (services/stylist/*). Tries Nemotron on Crusoe Managed Inference
// first — that's the model the agent is built around — and falls back to Groq
// (llama-4-scout) if Crusoe is unset or errors. Same content shape on both
// (OpenAI chat-completions messages with text/image_url parts).
//
// Why a unified call site:
// - The stylist files (analyze.js, critic.js, assess.js) all want "give me JSON
//   from a prompt + some images" with no provider awareness.
// - Crusoe's Nemotron-3-Nano-Omni spends output tokens on a reasoning trace
//   before the answer; the budget arithmetic and the tolerant JSON parsing
//   should live in one place, not duplicated per agent.
const Groq = require('groq-sdk')
const { CRUSOE_API_KEY, CRUSOE_BASE_URL, CRUSOE_MODEL, GROQ_API_KEY } = require('../config')
const { parseStylistJson } = require('./groq')

const TEXT_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

const groq = new Groq({ apiKey: GROQ_API_KEY })

// OpenAI-style content-part helpers. Shared by every stylist agent.
const img = (url) => ({ type: 'image_url', image_url: { url } })
const txt = (text) => ({ type: 'text', text })

const isCrusoeEnabled = () => Boolean(CRUSOE_API_KEY)

// Nemotron emits a reasoning trace before the JSON answer; if max_tokens is too
// tight, `content` comes back null and we'd fall back to Groq unnecessarily.
// The caller's `maxTokens` is the budget for the JSON answer itself; the buffer
// covers the chain-of-thought trace, which scales with input complexity —
// multi-image prompts (5+ images in the wardrobe orchestrator's analyzer/critic)
// need more room to reason than a text-only or 2-image call.
//
// Two-stage strategy:
// 1. Try with BASELINE_REASONING_BUFFER (covers the common case cheaply).
// 2. If Nemotron returns null content (only that — not auth / 429 / etc.),
//    retry once with RETRY_TOTAL_BUDGET before giving up on Crusoe. That keeps
//    the prize-relevant Nemotron path alive for the wide-image wardrobe agent
//    calls without making every call pay for the worst-case budget.
// Tiered baselines by modality. Multimodal Nemotron calls reason significantly
// longer than text-only ones (the model walks the visual evidence as well as
// the prompt), so they get a bigger first-try budget. Text-only calls keep the
// smaller baseline. Net effect: most calls succeed on the first try and we
// stop paying 16k-of-wasted-reasoning-then-48k-retry for the multimodal path.
const TEXT_BUFFER        = 16000
const MULTIMODAL_BUFFER  = 32000
const TEXT_FLOOR         = 16000
const MULTIMODAL_FLOOR   = 32000
const RETRY_TOTAL_BUDGET = 48000

// Detects an OpenAI-style multimodal content array. Cheap: scans for the
// marker `type: 'image_url'` produced by the img() helper above.
function isMultimodal(content) {
  return Array.isArray(content) && content.some(p => p && p.type === 'image_url')
}

// Distinguishable error type so the outer caller knows "Nemotron ran but its
// reasoning ate the budget" vs "Crusoe is down/unauthorized/rate-limited".
class CrusoeBudgetExhaustedError extends Error {
  constructor(message) { super(message); this.name = 'CrusoeBudgetExhaustedError' }
}

async function callCrusoeJSONOnce({ content, maxTokens, temperature, budget }) {
  const body = {
    model: CRUSOE_MODEL,
    messages: [{ role: 'user', content }],
    max_tokens: budget,
    reasoning_effort: 'low',
    temperature: typeof temperature === 'number' ? temperature : 0.5,
  }
  const res = await fetch(`${CRUSOE_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${CRUSOE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Crusoe ${res.status}: ${detail.slice(0, 300)}`)
  }
  const json = await res.json()
  const text = json.choices?.[0]?.message?.content
  if (!text) {
    throw new CrusoeBudgetExhaustedError(`Crusoe returned no content (reasoning ate the ${budget}-token budget)`)
  }
  return parseStylistJson(text)
}

// Outer Crusoe call: baseline budget first (tiered by modality), retry-with-
// bigger-budget exactly once on null-content, then surface any other error to
// the caller. `label` is a free-text identifier (e.g. "wardrobe-critic") used
// only in logs so "which step blew the budget?" is answerable without an APM.
async function callCrusoeJSON({ content, maxTokens, temperature, label }) {
  const multimodal = isMultimodal(content)
  const buffer = multimodal ? MULTIMODAL_BUFFER : TEXT_BUFFER
  const floor  = multimodal ? MULTIMODAL_FLOOR  : TEXT_FLOOR
  const baseline = Math.max(maxTokens + buffer, floor)
  const tag = label ? ` (${label})` : ''
  try {
    return await callCrusoeJSONOnce({ content, maxTokens, temperature, budget: baseline })
  } catch (err) {
    if (err instanceof CrusoeBudgetExhaustedError && baseline < RETRY_TOTAL_BUDGET) {
      console.warn(`[llm]${tag} Crusoe budget tight (${baseline}); retrying once at ${RETRY_TOTAL_BUDGET}…`)
      return callCrusoeJSONOnce({ content, maxTokens, temperature, budget: RETRY_TOTAL_BUDGET })
    }
    throw err
  }
}

async function callGroqJSONFallback({ content, maxTokens, temperature, model }) {
  const response = await groq.chat.completions.create({
    model: model || VISION_MODEL,
    messages: [{ role: 'user', content }],
    max_tokens: maxTokens,
    temperature: typeof temperature === 'number' ? temperature : 0.5,
  })
  return parseStylistJson(response.choices[0].message.content)
}

// Crusoe-first call. Each call gets one Groq fallback shot if Crusoe errors —
// including a still-empty answer after the budget retry. The caller's `model`
// argument is honored only on the Groq path (Crusoe always uses CRUSOE_MODEL).
// `label` (optional) is logged when Crusoe falls back so we know which step
// failed — keep these stable strings; they're used to spot patterns.
async function callJSON({ content, maxTokens = 800, temperature = 0.5, model, label } = {}) {
  const tag = label ? ` (${label})` : ''
  if (isCrusoeEnabled()) {
    try {
      return await callCrusoeJSON({ content, maxTokens, temperature, label })
    } catch (err) {
      console.warn(`[llm]${tag} Crusoe call failed, falling back to Groq:`, err.message)
    }
  }
  return callGroqJSONFallback({ content, maxTokens, temperature, model })
}

// Shared scoring rubric used by every critic prompt (services/stylist/critic.js
// for new-item try-ons, services/stylist/wardrobeOrchestrator.js for wardrobe
// outfits). LLMs default to generous numbers unless you anchor them. This is
// deliberately TIGHT — every anchored example the model reads becomes reasoning
// output (chain-of-thought walks each level), so length here ≈ token cost on
// the critic call. Color stays fully anchored because that's where users
// complained about leniency; the other three axes get one-line descriptions
// since they're less controversial.
const SCORING_RUBRIC = `Calibration: be a REAL critic. The DEFAULT for an average user pairing is 5-6, NOT 8+. Reserve 9-10 for outfits that show clear styling intent.

color_harmony — apply color theory:
  10: deliberate complementary or analogous palette, cleanly executed (e.g. terracotta + sage; navy + camel)
   8: cohesive palette with one accent
   6: workable but unremarkable — colors don't fight, no styling intent
   4: same-tone repetition (blue + blue = monotony), one subtle clash, OR two saturated colors with no neutral anchor
   2: pieces actively fight (red + pink, muddy mix)
  Caps: same hue across pieces with no contrast = max 5. Neutrals (black/white/grey/cream/denim) do NOT count toward harmony.

formality_match — same formality register across all pieces (e.g. business jacket + athletic shorts = below 5)
occasion_coherence — reads as ONE occasion, not multiple (e.g. cocktail top + gym shoes = below 5)
silhouette — proportions and balance on this person's frame

WEAKEST-LINK RULE on overall: if any axis is 4 or below, overall cannot exceed 6. If every score is 8+, you're being too generous — find the weak point.`

// Nemotron-first candidate ranker for recommendations. Same prompt as the Groq
// path but routed through callJSON so Crusoe/Nemotron is tried first.
async function rankCandidates(wardrobeItem, candidates) {
  const wardrobeDesc = `${wardrobeItem.color || 'unknown color'} ${wardrobeItem.category}${wardrobeItem.description ? ` — ${wardrobeItem.description}` : ''}`
  const candidateList = candidates.map((c, i) =>
    `${i}: ${c.color || 'unknown color'} ${c.category} — "${c.name}" by ${c.brand}`
  ).join('\n')

  const prompt = `You are a professional fashion stylist. Pick the single best outfit pairing for the wardrobe item below.

Wardrobe item: ${wardrobeDesc}

Candidates:
${candidateList}

Fashion rules:
- Colors must COMPLEMENT, not match (blue jeans → white/black/grey/red top, NOT another blue item)
- Use contrast: dark bottom + light top, or vice versa
- Match the style register (casual with casual, formal with formal)
- A dress is a full outfit — only pairs with outerwear or shoes

Return ONLY valid JSON, no markdown: { "best_index": <0-${candidates.length - 1}>, "style_score": <60-99>, "reason": "<one sentence>" }

style_score is how well the best pick pairs with the wardrobe item as a complete outfit (60 = decent, 75 = good, 90+ = excellent). Be honest — reserve 90+ for truly great pairings.`

  const result = await callJSON({
    content: [txt(prompt)],
    maxTokens: 150,
    temperature: 0.2,
    label: 'rank-candidates',
  })
  const idx = parseInt(result.best_index)
  const score = parseInt(result.style_score)
  return {
    index: Number.isFinite(idx) ? Math.min(idx, candidates.length - 1) : 0,
    reason: result.reason || '',
    styleScore: Number.isFinite(score) ? Math.min(99, Math.max(60, score)) : null,
  }
}

module.exports = { callJSON, rankCandidates, img, txt, TEXT_MODEL, VISION_MODEL, isCrusoeEnabled, SCORING_RUBRIC }
