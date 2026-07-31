package com.agence.location.auth;

public record TokenResponse(String accessToken, String refreshToken, String tokenType) {}
