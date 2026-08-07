package com.agence.location.dashboard;

import com.agence.location.vehicule.VehiculeStatut;

public record DashboardVehicleAlertItem(
    Long vehiculeId,
    String immatriculation,
    String marque,
    String modele,
    VehiculeStatut statut,
    Long kilometrage,
    Long kilomettresDepuisDerniereVidange
) {
}
