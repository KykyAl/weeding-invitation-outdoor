CREATE TABLE stories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id  UUID NOT NULL REFERENCES weddings (id) ON DELETE CASCADE,
  year        INTEGER,
  title       VARCHAR(150),
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stories_wedding_id ON stories (wedding_id);
