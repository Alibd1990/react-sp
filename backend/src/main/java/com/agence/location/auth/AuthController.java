package com.agence.location.auth;

import com.agence.location.common.exception.BusinessException;
import com.agence.location.config.security.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

  private final UserDetailsService userDetailsService;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  @PostMapping("/login")
  public TokenResponse login(@Valid @RequestBody LoginRequest request) {
    UserDetails user = userDetailsService.loadUserByUsername(request.username());
    if (!passwordEncoder.matches(request.password(), user.getPassword())) {
      throw new BusinessException("Identifiants invalides");
    }

    String role = user.getAuthorities().stream().findFirst()
        .map(a -> a.getAuthority().replace("ROLE_", ""))
        .orElse("CLIENT");

    String accessToken = jwtService.generateAccessToken(user.getUsername(), role);
    String refreshToken = jwtService.generateRefreshToken(user.getUsername(), role);
    return new TokenResponse(accessToken, refreshToken, "Bearer");
  }

  @PostMapping("/refresh")
  public TokenResponse refresh(@Valid @RequestBody RefreshRequest request) {
    Claims claims = jwtService.parseClaims(request.refreshToken());
    String username = claims.getSubject();
    String role = claims.get("role", String.class);
    String accessToken = jwtService.generateAccessToken(username, role);
    return new TokenResponse(accessToken, request.refreshToken(), "Bearer");
  }
}
