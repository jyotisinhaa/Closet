// One-off: enrich existing wardrobe items with structured style metadata so the
// agentic try-on has consistent data to reason over.
//
//   node scripts/backfill-metadata.js          # only items missing metadata
//   node scripts/backfill-metadata.js --force   # re-tag everything
const { readData, writeData } = require('../lib/db')
const { tagWardrobeItem } = require('../services/stylist/analyze')

const force = process.argv.includes('--force')
const needsTags = (it) => force || !Array.isArray(it.style_tags) || it.style_tags.length === 0 || !it.formality

async function main() {
  const data = readData()
  const wardrobe = data.wardrobe || []
  const todo = wardrobe.filter(needsTags)

  console.log(`Wardrobe items: ${wardrobe.length} · to tag: ${todo.length}${force ? ' (force)' : ''}`)

  for (const item of todo) {
    try {
      const tags = await tagWardrobeItem(item.image_url)
      item.category    = item.category || tags.category || 'Top'
      item.color       = item.color || tags.color || ''
      item.description = item.description || tags.description || ''
      item.style_tags  = tags.style_tags || []
      item.formality   = tags.formality || 'casual'
      item.palette     = tags.palette || (tags.color ? [tags.color] : [])
      item.season      = tags.season || ['all']
      item.pattern     = tags.pattern || 'solid'
      console.log(`  ✓ ${item.description || item.category} → [${item.style_tags.join(', ')}] ${item.formality}`)
      writeData(data) // persist after each so a crash doesn't lose progress
      await new Promise(r => setTimeout(r, 600)) // be gentle on rate limits
    } catch (err) {
      console.error(`  ✗ ${item.id}: ${err.message}`)
    }
  }

  console.log('Backfill complete.')
}

main().catch(err => { console.error(err); process.exit(1) })
