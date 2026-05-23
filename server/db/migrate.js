// Run once to create all tables: node db/migrate.js
require('../config')
const fs   = require('fs')
const path = require('path')
const pool = require('./client')

async function migrate() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(schema)
  console.log('✓ Schema applied successfully')
  await pool.end()
}

migrate().catch(err => { console.error('Migration failed:', err.message); process.exit(1) })
