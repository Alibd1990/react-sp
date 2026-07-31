ALTER TABLE vehicules
  ADD COLUMN IF NOT EXISTS couleur VARCHAR(40) NOT NULL DEFAULT 'Non renseignee';

UPDATE vehicules
SET couleur = 'Non renseignee'
WHERE couleur IS NULL;