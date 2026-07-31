CREATE TABLE clients (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  nom VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  permis_numero VARCHAR(80) NOT NULL,
  permis_expiration DATE NOT NULL,
  blackliste BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE vehicules (
  id BIGSERIAL PRIMARY KEY,
  immatriculation VARCHAR(30) UNIQUE NOT NULL,
  marque VARCHAR(80) NOT NULL,
  modele VARCHAR(80) NOT NULL,
  annee INT NOT NULL,
  statut VARCHAR(30) NOT NULL,
  kilometrage BIGINT NOT NULL,
  categorie VARCHAR(60) NOT NULL,
  tarif_jour NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE reservations (
  id BIGSERIAL PRIMARY KEY,
  vehicule_id BIGINT NOT NULL REFERENCES vehicules(id),
  client_id BIGINT NOT NULL REFERENCES clients(id),
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  statut VARCHAR(30) NOT NULL,
  prix_estime NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reservations_vehicule_dates ON reservations (vehicule_id, date_debut, date_fin);
CREATE INDEX idx_vehicules_statut ON vehicules (statut);
