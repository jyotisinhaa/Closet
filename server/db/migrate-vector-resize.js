// Run once to resize embedding columns from vector(512) to vector(1024): node db/migrate-vector-resize.js
require('../config')
const pool = require('./client')

async function run() {
  await pool.query(`
    DROP INDEX IF EXISTS catalog_embedding_idx;
    DROP INDEX IF EXISTS wardrobe_embedding_idx;

    ALTER TABLE catalog_items  DROP COLUMN IF EXISTS embedding;
    ALTER TABLE catalog_items  ADD  COLUMN embedding vector(1024);

    ALTER TABLE wardrobe_items DROP COLUMN IF EXISTS embedding;
    ALTER TABLE wardrobe_items ADD  COLUMN embedding vector(1024);

    CREATE INDEX catalog_embedding_idx  ON catalog_items  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
    CREATE INDEX wardrobe_embedding_idx ON wardrobe_items USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
  `)
  console.log('✓ Embedding columns resized to vector(1024)')
  await pool.end()
}

run().catch(err => { console.error('Migration failed:', err.message); process.exit(1) })
