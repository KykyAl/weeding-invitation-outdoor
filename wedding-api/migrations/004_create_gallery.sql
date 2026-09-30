CREATE TABLE gallery (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings (id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  caption    TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gallery_wedding_id ON gallery (wedding_id);
