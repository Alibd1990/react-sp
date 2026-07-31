package com.agence.location.config.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final SecretKey key;
  private final long accessExpirationSeconds;
  private final long refreshExpirationSeconds;

  public JwtService(
      @Value("${app.security.jwt.secret}") String secret,
      @Value("${app.security.jwt.access-expiration-seconds}") long accessExpirationSeconds,
      @Value("${app.security.jwt.refresh-expiration-seconds}") long refreshExpirationSeconds
  ) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.accessExpirationSeconds = accessExpirationSeconds;
    this.refreshExpirationSeconds = refreshExpirationSeconds;
  }

  public String generateAccessToken(String username, String role) {
    Instant now = Instant.now();
    return Jwts.builder()
        .subject(username)
        .claim("role", role)
      .claim("tokenType", "access")
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plusSeconds(accessExpirationSeconds)))
        .signWith(key)
        .compact();
  }

    public String generateRefreshToken(String username, String role) {
      Instant now = Instant.now();
      return Jwts.builder()
      .subject(username)
      .claim("role", role)
      .claim("tokenType", "refresh")
      .issuedAt(Date.from(now))
      .expiration(Date.from(now.plusSeconds(refreshExpirationSeconds)))
      .signWith(key)
      .compact();
    }

  public Claims parseClaims(String token) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
  }
}
