package com.agence.location.vehicule;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record VehiculeRequest(
    @NotBlank String immatriculation,
    @NotBlank String marque,
    @NotBlank String modele,
    @NotNull @Min(1950) Integer annee,
    @NotNull VehiculeStatut statut,
    @NotNull @Min(0) Long kilometrage,
    @NotBlank String categorie,
    @NotBlank String couleur,
    LocalDate assuranceExpiration,
    LocalDate controleTechniqueExpiration,
    @Min(0) Long prochainEntretienKm,
    LocalDate prochaineMaintenanceDate
) {
}
