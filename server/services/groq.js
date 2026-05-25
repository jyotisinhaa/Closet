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
2. Identify the correct category from the image. Use exactly one of: "Top", "Shirt", "Jeans", "Bottom", "Dress", "Skirt", "Outerwear", "Shoes", "Bag", "Hat", "Scarf", "Accessory". Trust the image, not any label provided.
3. Identify the style tags for the garment (e.g. ["Utility", "Casual"] or ["Formal", "Minimalist"]).
4. Look at the person and the garment — assess honestly how this item would look on them. Address the user directly as "you". Be specific and kind but truthful.
5. Check the wardrobe list — count how many similar items they already own (same type/category). Describe it briefly (e.g. "2 jackets", "1 similar dress", "none").
6. Pick 2 outfit combinations from their wardrobe that would work well with this new item. Do NOT include any item whose category is "Scarf" in these combinations — scarves can't be layered into the try-on render. (You may still count scarves for similar_owned above.)

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

module.exports = { buildPairingWithGroq }
