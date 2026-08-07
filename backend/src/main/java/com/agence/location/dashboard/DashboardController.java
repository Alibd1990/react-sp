package com.agence.location.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

  private final DashboardService dashboardService;

  @GetMapping("/alertes")
  @PreAuthorize("hasAnyRole('ADMIN','AGENT')")
  public DashboardAlertsResponse alertes() {
    return dashboardService.getAlerts();
  }
}
