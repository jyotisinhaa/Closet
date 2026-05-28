// Adds user_id columns to all per-user tables and cleans up the hardcoded demo row.
// Run once: node db/migrate-user-scoping.js
require('../config')
const pool = require('./client')

async function migrate() {
  console.log('Running user-scoping migration...')

  await pool.query(`
    ALTER TABLE wardrobe_items
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE
  `)
  console.log('✓ wardrobe_items.user_id')

  await pool.query(`
    ALTER TABLE saved_looks
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE
  `)
  console.log('✓ saved_looks.user_id')

  await pool.query(`
    ALTER TABLE wishlist_items
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE
  `)
  console.log('✓ wishlist_items.user_id')

  // Remove the hardcoded demo row — real users get their own rows keyed by UUID
  await pool.query("DELETE FROM profile WHERE id = 'demo-user-1'")
  console.log('✓ removed demo-user-1 from profile')

  console.log('Migration complete.')
  process.exit(0)
}

migrate().catch(err => { console.error('Migration failed:', err); process.exit(1) })
