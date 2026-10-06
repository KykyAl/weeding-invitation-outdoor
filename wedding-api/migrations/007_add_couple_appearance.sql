-- How the couple is drawn in the illustrated scenes (not photos).
-- Skin tones: light | langsat (kuning langsat) | medium | tan | deep.
ALTER TABLE weddings
  ADD COLUMN bride_hijab     BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN groom_skin_tone VARCHAR(20) NOT NULL DEFAULT 'langsat'
    CHECK (groom_skin_tone IN ('light', 'langsat', 'medium', 'tan', 'deep')),
  ADD COLUMN bride_skin_tone VARCHAR(20) NOT NULL DEFAULT 'langsat'
    CHECK (bride_skin_tone IN ('light', 'langsat', 'medium', 'tan', 'deep'));
