ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS kilometrage_depart BIGINT,
  ADD COLUMN IF NOT EXISTS kilometrage_retour BIGINT;

ALTER TABLE vehicules
  ADD COLUMN IF NOT EXISTS derniere_vidange_km BIGINT,
  ADD COLUMN IF NOT EXISTS derniere_vidange_date DATE;

CREATE INDEX IF NOT EXISTS idx_reservations_date_fin ON reservations (date_fin);
