// Adds style classification columns: node db/migrate-style-tags.js
//
// wardrobe_items.style_tags  — per-item tags from the Crusoe classifier
// profile.style_profile      — aggregate {tag: count} map across the wardrobe
// profile.style_prefs        — top 3 tags by count, surfaced in the Profile UI
require("../config");
const pool = require("./client");

async function run() {
  await pool.query(`
    ALTER TABLE wardrobe_items
      ADD COLUMN IF NOT EXISTS style_tags TEXT[] DEFAULT '{}';
  `);
  // Brings the profile table up to the full canonical shape. Idempotent: the
  // first block here mirrors migrate-profile-fields.js so this single migration
  // is enough on a DB that never had the earlier one applied.
  await pool.query(`
    ALTER TABLE profile
      ADD COLUMN IF NOT EXISTS gender        TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS body_type     TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS name          TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS height_ft     TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS height_cm     TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS size_tops     TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS size_bottoms  TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS size_shoes    TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS style_profile JSONB  DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS style_prefs   TEXT[] DEFAULT '{}';
  `);
  console.log(
    "✓ Profile + wardrobe brought up to date (style_tags, style_profile, style_prefs, plus any missing profile columns)",
  );
  await pool.end();
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
