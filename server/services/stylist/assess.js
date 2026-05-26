// Assessment agent (text). Fuses the deterministic signals (duplicates,
// versatility, gap) plus the analyzer's fit note into one candid verdict.
// The whole point of Closet's "honest take" is that it sometimes says "skip it".
// Multimodal call helper — Crusoe-first (Nemotron), Groq fallback.
const { callJSON, txt, TEXT_MODEL } = require('../llm')

async function writeAssessment({ itemName, fitNote, gender, duplicates, versatility, gap }) {
  const prompt = `You are a brutally honest but kind personal stylist. Write the verdict on whether the user should buy "${itemName}".

Signals (already computed — trust them):
- User identifies as: ${gender || 'unspecified'}
- Fit on the user: ${fitNote || 'n/a'}
- Similar items they already own: ${duplicates.summary} ${duplicates.count ? `(${duplicates.items.slice(0, 3).map(d => d.item.description || d.item.category).join(', ')})` : ''}
- Versatility: pairs with ${versatility.count} of ${versatility.total} relevant items they own (${versatility.score}/100)
- Wardrobe gap: ${gap.summary} (fills a gap: ${gap.fills_gap ? 'yes' : 'no'})

Write 2-3 sentences, addressing the user directly as "you". Be specific and candid: if they already own similar pieces or it has low versatility, say "skip it" or "only if..." plainly. If it fills a real gap and is versatile, say so. Do NOT invent facts beyond the signals.

Gender-fit backstop: if the "Fit on the user" signal flags a gendered-cut mismatch (e.g. wording like "cut for menswear", "men's silhouette", "the shoulders will hang", "wrong proportions for your frame"), do NOT paper over it — mirror that into your verdict and say "skip it" plainly in the first sentence.

Return ONLY valid JSON, no markdown: { "honest_assessment": "..." }`

  try {
    const data = await callJSON({ content: [txt(prompt)], model: TEXT_MODEL, maxTokens: 300, temperature: 0.6, label: 'assess-new' })
    return data.honest_assessment || fallback({ duplicates, versatility, gap })
  } catch {
    return fallback({ duplicates, versatility, gap })
  }
}

// Deterministic fallback so the result screen always has a verdict.
function fallback({ duplicates, versatility, gap }) {
  if (duplicates.count >= 2) return `You already own ${duplicates.summary} — skip this unless it offers something genuinely different.`
  if (gap.fills_gap && versatility.count >= 3) return `This fills a real gap and pairs with ${versatility.count} pieces you own — a confident yes.`
  if (versatility.count <= 1) return `This pairs with very little in your closet right now, so it would be a low-versatility buy.`
  return `A reasonable pick: it pairs with ${versatility.count} of your pieces. ${gap.summary}`
}

module.exports = { writeAssessment }
