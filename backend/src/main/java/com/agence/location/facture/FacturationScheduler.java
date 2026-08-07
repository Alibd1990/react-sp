package com.agence.location.facture;

import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class FacturationScheduler {

  private final FactureService factureService;

  @Scheduled(cron = "${app.billing.auto-cron:0 0 2 * * *}")
  public void generateFacturesForEndedReservations() {
    int generated = factureService.generateAutomaticFactures(LocalDate.now());
    if (generated > 0) {
      log.info("Auto-facturation: {} facture(s) generee(s)", generated);
    }
  }
}
