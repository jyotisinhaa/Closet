// Vision agents that produce structured style metadata. The shared vocabulary
// (categories, formality, season) must match server/lib/styleRules.js so the
// deterministic tools can reason over it.
// Multimodal call helper — Crusoe-first (Nemotron), Groq fallback.
const { callJSON, img, txt } = require('../llm')

const CATEGORY_VOCAB = 'Top, Shirt, Jeans, Bottom, Dress, Skirt, Outerwear, Shoes, Bag, Accessory'
const FORMALITY_VOCAB = 'casual, smart_casual, business, formal'
const SEASON_VOCAB = 'spring, summer, fall, winter, all'

const METADATA_SHAPE = `{
  "category": "ONE of: ${CATEGORY_VOCAB}",
  "color": "single-word primary color, lowercase",
  "palette": ["1-3 dominant colors, lowercase single words"],
  "formality": "ONE of: ${FORMALITY_VOCAB}",
  "season": ["any of: ${SEASON_VOCAB}"],
  "pattern": "solid | striped | checked | print | textured",
  "style_tags": ["2-4 lowercase style descriptors, e.g. utility, minimal, classic, sporty, boho"]
}`

// Analyzer agent — identifies the new item AND assesses how it suits the person.
// Sees the profile photo (image 1) and the new garment (image 2).
async function analyzeNewItem({ newItemUrl, profilePhotoUrl, hints = {} }) {
  const hintLines = [
    hints.category ? `User-provided category hint: ${hints.category}` : '',
    hints.color ? `User-provided color hint: ${hints.color}` : '',
    hints.price ? `Price: $${hints.price}` : '',
    hints.store ? `Store: ${hints.store}` : '',
    hints.gender ? `The user identifies as ${hints.gender}.` : '',
  ].filter(Boolean).join('\n')

  // The gender-fit instruction is deliberately nuanced — cross-gender styling
  // that genuinely works (oxford shirts, blazers cut for women, oversized tees)
  // is fine to accept; but a piece visibly cut for the *other* gender's frame
  // (men's suit-jacket shoulders on a women's silhouette, etc.) should be
  // called out plainly so the assessment can recommend skipping it.
  const prompt = `You are a fashion analyst with sharp visual skills.
Image 1 is the person who would wear the item. Image 2 is the new garment they are considering.
${hintLines ? `\n${hintLines}\n` : ''}
Trust the IMAGE over any hint.

Gender-fit check (only when the user's gender is stated above):
- Evaluate whether the garment's cut, silhouette, and intended audience suit this person.
- Cross-gender styling that genuinely works (e.g. a woman in oversized menswear, men in unisex pieces) is FINE to approve.
- BUT if the garment is visibly cut for a different gender's frame in a way that would noticeably read as ill-fitting on this person (e.g. menswear suit-jacket shoulders/sleeves on a women's silhouette, or a women's tailored blouse on a men's torso), say so PLAINLY in fit_note (e.g. "this is cut for menswear — the shoulders and sleeves will hang on your frame, skip it"). Do not soften it.

Return ONLY valid JSON, no markdown:
{
  "item_name": "short descriptive name, e.g. 'Olive utility jacket'",
  "metadata": ${METADATA_SHAPE},
  "fit_note": "one honest sentence on how this would look on THIS person, addressing them as 'you'. If the gender-fit check above triggers, lead with that."
}`

  const data = await callJSON({
    content: [img(profilePhotoUrl), img(newItemUrl), txt(prompt)],
    maxTokens: 700,
    temperature: 0.5,
    label: 'analyzer-new',
  })

  const m = data.metadata || {}
  return {
    item_name: data.item_name || '',
    fit_note: data.fit_note || '',
    category: m.category || hints.category || 'Top',
    color: m.color || hints.color || '',
    palette: Array.isArray(m.palette) ? m.palette : (m.color ? [m.color] : []),
    formality: m.formality || 'casual',
    season: Array.isArray(m.season) && m.season.length ? m.season : ['all'],
    pattern: m.pattern || 'solid',
    style_tags: Array.isArray(m.style_tags) ? m.style_tags : [],
  }
}

// Add-time tagger — produces the same metadata for a wardrobe item from its image
// alone. Used by POST /api/wardrobe and the backfill script.
async function tagWardrobeItem(imageUrl) {
  const prompt = `Look at this single clothing item. Return ONLY valid JSON, no markdown:
{
  "description": "short phrase, e.g. 'olive cotton field jacket'",
  ...${METADATA_SHAPE}
}
(Put all the metadata fields and "description" at the top level of the JSON object.)`

  const m = await callJSON({
    content: [img(imageUrl), txt(prompt)],
    maxTokens: 500,
    temperature: 0.4,
    label: 'wardrobe-tag',
  })

  return {
    description: m.description || '',
    category: m.category || 'Top',
    color: m.color || (Array.isArray(m.palette) ? m.palette[0] : '') || '',
    palette: Array.isArray(m.palette) ? m.palette : (m.color ? [m.color] : []),
    formality: m.formality || 'casual',
    season: Array.isArray(m.season) && m.season.length ? m.season : ['all'],
    pattern: m.pattern || 'solid',
    style_tags: Array.isArray(m.style_tags) ? m.style_tags : [],
  }
}

module.exports = { analyzeNewItem, tagWardrobeItem }
