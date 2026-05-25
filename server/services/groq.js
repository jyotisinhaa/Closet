// Groq vision model: pairs a new garment against the user's wardrobe and returns
// an honest assessment plus outfit combinations.
const Groq = require('groq-sdk')
const { GROQ_API_KEY } = require('../config')

const groq = new Groq({ apiKey: GROQ_API_KEY })

async function buildPairingWithGroq(newItemUrl, profilePhotoUrl, category, price, color, store, wardrobe) {
  if (wardrobe.length === 0) {
    return { combinations: [], honest_assessment: 'Add items to your wardrobe to get outfit pairing suggestions.' }
  }

  const wardrobeList = wardrobe.map(item =>
    `- id=${item.id}, category=${item.category}, color=${item.color || 'unknown'}, description=${item.description || item.category}`
  ).join('\n')

  const prompt = `You are a personal stylist with sharp visual analysis skills.

Image 1 (above) is the person — this is who will be wearing the item.
Image 2 (above) is the new garment they are considering buying.

Price: $${price}
${color ? `Color: ${color}` : ''}
${store ? `Store: ${store}` : ''}

Their existing wardrobe:
${wardrobeList}

Your job:
1. Visually identify the garment — give it a short descriptive name (e.g. "Olive utility jacket", "Floral midi dress").
2. Identify the correct category from the image (e.g. "Dress", "Jacket", "Top", "Pants", "Skirt", "Outerwear"). Trust the image, not any label provided.
3. Identify the style tags for the garment (e.g. ["Utility", "Casual"] or ["Formal", "Minimalist"]).
4. Look at the person and the garment — assess honestly how this item would look on them. Address the user directly as "you". Be specific and kind but truthful.
5. Check the wardrobe list — count how many similar items they already own (same type/category). Describe it briefly (e.g. "2 jackets", "1 similar dress", "none").
6. Pick 2 outfit combinations from their wardrobe that would work well with this new item.

Return ONLY valid JSON, no markdown, no code blocks:
{
  "item_name": "short descriptive name for the garment",
  "detected_category": "correct category detected from image",
  "style_tags": ["tag1", "tag2"],
  "similar_owned": "e.g. '2 jackets' or 'none'",
  "combinations": [
    {
      "name": "short occasion name",
      "wardrobe_item_ids": ["id1", "id2"],
      "styling_note": "one sentence on why it works visually"
    }
  ],
  "honest_assessment": "2-3 sentences: how it looks on you (address the user directly as 'you'), and whether it fills a real gap or duplicates something you already own."
}`

  const response = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: profilePhotoUrl } },
        { type: 'image_url', image_url: { url: newItemUrl } },
        { type: 'text', text: prompt },
      ],
    }],
    max_tokens: 1024,
    temperature: 0.7,
  })

  const text = response.choices[0].message.content.trim()
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  return JSON.parse(cleaned)
}

// Given a wardrobe item and up to 5 vector candidates, pick the best outfit pair
// using fashion color theory and style rules. Text-only — fast and cheap.
async function rankCandidatesWithGroq(wardrobeItem, candidates) {
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

  const response = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
    temperature: 0.2,
  })

  const text = response.choices[0].message.content.trim()
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  const result = JSON.parse(cleaned)
  const idx = parseInt(result.best_index)
  const score = parseInt(result.style_score)
  return {
    index: Number.isFinite(idx) ? Math.min(idx, candidates.length - 1) : 0,
    reason: result.reason || '',
    styleScore: Number.isFinite(score) ? Math.min(99, Math.max(60, score)) : null,
  }
}

module.exports = { buildPairingWithGroq, rankCandidatesWithGroq }
