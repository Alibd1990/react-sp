package com.agence.location.reservation;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ReservationResponse(
    Long id,
    Long vehiculeId,
    Long clientId,
    LocalDate dateDebut,
    LocalDate dateFin,
    ReservationStatus statut,
    BigDecimal tarifJournalier,
    BigDecimal acompteTnd,
    BigDecimal cautionTnd,
    BigDecimal prixEstime
) {}
