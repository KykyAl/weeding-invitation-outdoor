CREATE TABLE rsvps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id  UUID NOT NULL REFERENCES weddings (id) ON DELETE CASCADE,
  guest_name  VARCHAR(150) NOT NULL,
  attendance  VARCHAR(30) NOT NULL CHECK (attendance IN ('attending', 'not_attending')),
  guest_count INTEGER NOT NULL DEFAULT 1 CHECK (guest_count BETWEEN 1 AND 10),
  message     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rsvps_wedding_id ON rsvps (wedding_id);
