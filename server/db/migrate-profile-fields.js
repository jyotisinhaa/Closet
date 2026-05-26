// Adds extended profile fields: node db/migrate-profile-fields.js
require("../config");
const pool = require("./client");

async function run() {
  await pool.query(`
    ALTER TABLE profile
      ADD COLUMN IF NOT EXISTS gender        TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS body_type     TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS name          TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS height_ft     TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS height_cm     TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS size_tops     TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS size_bottoms  TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS size_shoes    TEXT DEFAULT '';
  `);
  console.log(
    "✓ Profile table extended with name, gender, body_type, height, sizes",
  );
  await pool.end();
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
