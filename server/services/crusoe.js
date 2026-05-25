// Crusoe Managed Inference (NVIDIA Nemotron). Runs the stylist wardrobe analysis
// on a multimodal Nemotron model via Crusoe's OpenAI-compatible endpoint. Shares
// the prompt + JSON parser with the Groq path so the two stay in lockstep.
const { CRUSOE_API_KEY, CRUSOE_BASE_URL, CRUSOE_MODEL } = require('../config')
const { buildStylistPrompt, parseStylistJson } = require('./groq')

const isCrusoeEnabled = () => Boolean(CRUSOE_API_KEY)

async function buildPairingWithCrusoe(newItemUrl, profilePhotoUrl, category, price, color, store, wardrobe) {
  if (!CRUSOE_API_KEY) throw new Error('CRUSOE_API_KEY not set')
  if (wardrobe.length === 0) {
    return { combinations: [], honest_assessment: 'Add items to your wardrobe to get outfit pairing suggestions.' }
  }

  const prompt = buildStylistPrompt(category, price, color, store, wardrobe)

  const body = {
    model: CRUSOE_MODEL,
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: profilePhotoUrl } },
        { type: 'image_url', image_url: { url: newItemUrl } },
        { type: 'text', text: prompt },
      ],
    }],
    // Nemotron spends output tokens on its reasoning trace before emitting the
    // answer, so the budget must cover BOTH the reasoning and the JSON or
    // `content` comes back null. Keep reasoning light and give generous headroom.
    max_tokens: 6000,
    reasoning_effort: 'low',
    temperature: 0.7,
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
  if (!text) throw new Error(`Crusoe returned no content: ${JSON.stringify(json).slice(0, 300)}`)
  return parseStylistJson(text)
}

module.exports = { buildPairingWithCrusoe, isCrusoeEnabled }
