ALTER TABLE clients ADD COLUMN cin VARCHAR(20);
UPDATE clients SET cin = CONCAT('CIN-', id) WHERE cin IS NULL;
ALTER TABLE clients ALTER COLUMN cin SET NOT NULL;
ALTER TABLE clients ADD CONSTRAINT uk_clients_cin UNIQUE (cin);

ALTER TABLE reservations ADD COLUMN tarif_journalier NUMERIC(12,2);
UPDATE reservations r
SET tarif_journalier = v.tarif_jour
FROM vehicules v
WHERE r.vehicule_id = v.id;
UPDATE reservations SET tarif_journalier = 0 WHERE tarif_journalier IS NULL;
ALTER TABLE reservations ALTER COLUMN tarif_journalier SET NOT NULL;

CREATE TABLE factures (
  id BIGSERIAL PRIMARY KEY,
  reservation_id BIGINT NOT NULL REFERENCES reservations(id),
  date_emission DATE NOT NULL,
  montant_tnd NUMERIC(12,2) NOT NULL,
  statut VARCHAR(20) NOT NULL,
  notes VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_factures_reservation ON factures (reservation_id);
