// Adds price column to wardrobe_items: node db/migrate-wardrobe-price.js
require('../config')
const pool = require('./client')

async function run() {
  await pool.query(`
    ALTER TABLE wardrobe_items
      ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
  `)
  console.log('✓ wardrobe_items.price column added')
  await pool.end()
}

run().catch(err => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
