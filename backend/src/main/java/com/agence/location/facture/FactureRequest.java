package com.agence.location.facture;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record FactureRequest(
    @NotNull Long reservationId,
    @NotNull LocalDate dateEmission,
    @NotNull @DecimalMin("0.0") BigDecimal montantTnd,
    @NotNull FactureStatut statut,
    String notes
) {
}
