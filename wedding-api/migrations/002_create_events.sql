CREATE TABLE events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id    UUID NOT NULL REFERENCES weddings (id) ON DELETE CASCADE,
  event_type    VARCHAR(50),
  title         VARCHAR(150),
  event_date    DATE,
  start_time    TIME,
  end_time      TIME,
  venue_name    VARCHAR(255),
  venue_address TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_wedding_id ON events (wedding_id);
