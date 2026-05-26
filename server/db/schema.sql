CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT DEFAULT '',
  password_hash TEXT NOT NULL,
  salt        TEXT NOT NULL,
  token       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile (
  id                TEXT PRIMARY KEY DEFAULT 'demo-user-1',
  profile_photo_url TEXT,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wardrobe_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url             TEXT NOT NULL,
  cloudinary_public_id  TEXT,
  category              TEXT NOT NULL DEFAULT 'Uncategorized',
  color                 TEXT DEFAULT '',
  description           TEXT DEFAULT '',
  embedding             vector(1024),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name           TEXT,
  new_item_image_url  TEXT,
  category            TEXT,
  price               NUMERIC,
  store               TEXT DEFAULT '',
  color               TEXT DEFAULT '',
  solo_render_url     TEXT,
  combinations        JSONB DEFAULT '[]',
  honest_assessment   TEXT DEFAULT '',
  bought              BOOLEAN DEFAULT FALSE,
  added_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catalog_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand       TEXT NOT NULL,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  color       TEXT DEFAULT '',
  price       NUMERIC DEFAULT 0,
  store_url   TEXT DEFAULT '',
  image_url   TEXT NOT NULL,
  style_tags  TEXT[] DEFAULT '{}',
  sponsored   BOOLEAN DEFAULT TRUE,
  embedding   vector(1024),
  added_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast vector similarity on catalog
CREATE INDEX IF NOT EXISTS catalog_embedding_idx ON catalog_items USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
CREATE INDEX IF NOT EXISTS wardrobe_embedding_idx ON wardrobe_items USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);

-- Liked/saved generated looks (the "Lookbook"). A look is one rendered composite
-- image the user liked from a try-on, plus the context that produced it.
CREATE TABLE IF NOT EXISTS saved_looks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  render_url      TEXT NOT NULL,
  title           TEXT DEFAULT '',
  item_name       TEXT DEFAULT '',
  category        TEXT DEFAULT '',
  price           NUMERIC DEFAULT 0,
  source          TEXT DEFAULT 'solo',   -- solo | pairing | custom
  item_image_urls JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
