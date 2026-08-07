package com.agence.location.vehicule;

import com.agence.location.reservation.ReservationStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public record VehiculeReservationHistoryItem(
    Long reservationId,
    Long clientId,
    String clientNom,
    LocalDate dateDebut,
    LocalDate dateFin,
    ReservationStatus statut,
    Long kilometrageDepart,
    Long kilometrageRetour,
    BigDecimal montantLocation
) {
}
