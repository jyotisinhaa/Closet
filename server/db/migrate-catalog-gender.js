// Adds gender column to catalog_items and tags existing rows: node db/migrate-catalog-gender.js
require('../config')
const pool = require('./client')

async function run() {
  await pool.query(`
    ALTER TABLE catalog_items
      ADD COLUMN IF NOT EXISTS gender VARCHAR(10) DEFAULT 'unisex' NOT NULL;
  `)
  console.log('✓ catalog_items.gender column added')

  // Default everything to unisex first
  await pool.query(`UPDATE catalog_items SET gender = 'unisex'`)

  // Male: names starting with "Men's"
  const { rowCount: maleCount } = await pool.query(`
    UPDATE catalog_items SET gender = 'male'
    WHERE name ILIKE 'Men''s%'
  `)
  console.log(`✓ Tagged ${maleCount} items as male`)

  // Female: dresses and skirts (entire category)
  const { rowCount: dressSkirtCount } = await pool.query(`
    UPDATE catalog_items SET gender = 'female'
    WHERE LOWER(category) IN ('dress', 'skirt')
  `)
  console.log(`✓ Tagged ${dressSkirtCount} dress/skirt items as female`)

  // Female tops (blouses, camisoles, spaghetti straps, ruched, ruffle, puff sleeve, off-shoulder, satin, silk, lace)
  const { rowCount: femaleTopCount } = await pool.query(`
    UPDATE catalog_items SET gender = 'female'
    WHERE LOWER(category) = 'top'
      AND name ~* '(blouse|camisole|spaghetti|ruched|ruffle|off.shoulder|puff sleeve|silk|satin|lace cami|floral wrap)'
  `)
  console.log(`✓ Tagged ${femaleTopCount} female-specific tops`)

  // Female shorts (satin mini, paperbag, high-waist)
  const { rowCount: femaleShortCount } = await pool.query(`
    UPDATE catalog_items SET gender = 'female'
    WHERE LOWER(category) = 'shorts'
      AND name ~* '(satin mini|paperbag|high.waist|high-waist)'
  `)
  console.log(`✓ Tagged ${femaleShortCount} female-specific shorts`)

  // Female jeans (skinny, curvy, wedgie, flare, mom, boyfriend, wide leg, high-rise, pinch waist)
  const { rowCount: femaleJeanCount } = await pool.query(`
    UPDATE catalog_items SET gender = 'female'
    WHERE LOWER(category) = 'jeans'
      AND name ~* '(skinny|curvy|wedgie|flare|mom jeans|boyfriend|wide leg|high.rise|pinch waist)'
  `)
  console.log(`✓ Tagged ${femaleJeanCount} female-specific jeans`)

  // Female accessories (earrings, gold hoop)
  const { rowCount: femaleAccCount } = await pool.query(`
    UPDATE catalog_items SET gender = 'female'
    WHERE name ~* '(earring|hoop|anklet)'
  `)
  console.log(`✓ Tagged ${femaleAccCount} female accessories`)

  // Summary
  const { rows } = await pool.query(`
    SELECT gender, COUNT(*) AS count FROM catalog_items GROUP BY gender ORDER BY gender
  `)
  console.log('\nGender distribution:')
  rows.forEach(r => console.log(`  ${r.gender}: ${r.count}`))

  await pool.end()
}

run().catch(err => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
