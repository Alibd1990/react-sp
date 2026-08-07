package com.agence.location.dashboard;

import com.agence.location.reservation.ReservationStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public record DashboardReservationAlertItem(
    Long reservationId,
    Long vehiculeId,
    String vehicule,
    Long clientId,
    String client,
    LocalDate dateDebut,
    LocalDate dateFin,
    ReservationStatus statut,
    BigDecimal montant,
    LocalDate dateFacture
) {
}
