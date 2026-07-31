package com.agence.location.facture;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FactureResponse(
    Long id,
    Long reservationId,
    Long vehiculeId,
    Long clientId,
    LocalDate dateEmission,
    BigDecimal montantTnd,
    FactureStatut statut,
    String notes
) {
}
