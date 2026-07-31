ALTER TABLE vehicules ADD COLUMN assurance_expiration DATE;
ALTER TABLE vehicules ADD COLUMN controle_technique_expiration DATE;
ALTER TABLE vehicules ADD COLUMN prochain_entretien_km BIGINT;
ALTER TABLE vehicules ADD COLUMN prochaine_maintenance_date DATE;

UPDATE vehicules SET statut = 'EN_LOCATION' WHERE statut = 'LOUE';

ALTER TABLE reservations ADD COLUMN acompte_tnd NUMERIC(12,2);
ALTER TABLE reservations ADD COLUMN caution_tnd NUMERIC(12,2);
UPDATE reservations SET acompte_tnd = 0 WHERE acompte_tnd IS NULL;
UPDATE reservations SET caution_tnd = 0 WHERE caution_tnd IS NULL;
ALTER TABLE reservations ALTER COLUMN acompte_tnd SET NOT NULL;
ALTER TABLE reservations ALTER COLUMN caution_tnd SET NOT NULL;
