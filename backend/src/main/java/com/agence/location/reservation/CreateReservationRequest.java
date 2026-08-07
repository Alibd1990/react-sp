package com.agence.location.reservation;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateReservationRequest(
    @NotNull Long vehiculeId,
    @NotNull Long clientId,
    @NotNull @FutureOrPresent LocalDate dateDebut,
    @NotNull @FutureOrPresent LocalDate dateFin,
    @NotNull @DecimalMin("0.0") BigDecimal tarifJournalier,
    @DecimalMin("0.0") BigDecimal acompteTnd,
    @DecimalMin("0.0") BigDecimal cautionTnd,
    @jakarta.validation.constraints.Min(0) Long kilometrageDepart,
    @jakarta.validation.constraints.Min(0) Long kilometrageRetour
) {}
