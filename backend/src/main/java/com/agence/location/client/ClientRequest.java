package com.agence.location.client;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ClientRequest(
    @NotNull ClientType type,
    @NotBlank String nom,
    @NotBlank @Email String email,
    @NotBlank String cin,
    @NotBlank String permisNumero,
    @NotNull LocalDate permisExpiration,
    boolean blackliste
) {
}
