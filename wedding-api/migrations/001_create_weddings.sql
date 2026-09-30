CREATE TABLE weddings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            VARCHAR(100) UNIQUE NOT NULL,
  groom_name      VARCHAR(100) NOT NULL,
  groom_full_name VARCHAR(150),
  bride_name      VARCHAR(100) NOT NULL,
  bride_full_name VARCHAR(150),
  wedding_date    DATE NOT NULL,
  quote           TEXT,
  quote_source    VARCHAR(255),
  venue_name      VARCHAR(255),
  venue_address   TEXT,
  venue_maps_url  TEXT,
  music_url       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- UNIQUE already creates an index; this named one documents the lookup path.
CREATE INDEX IF NOT EXISTS idx_weddings_slug ON weddings (slug);
