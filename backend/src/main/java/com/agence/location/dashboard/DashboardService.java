package com.agence.location.dashboard;

import com.agence.location.facture.Facture;
import com.agence.location.facture.FactureRepository;
import com.agence.location.reservation.Reservation;
import com.agence.location.reservation.ReservationRepository;
import com.agence.location.vehicule.Vehicule;
import com.agence.location.vehicule.VehiculeRepository;
import com.agence.location.vehicule.VehiculeStatut;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

  private static final long VIDANGE_ALERT_THRESHOLD_KM = 4500L;

  private final VehiculeRepository vehiculeRepository;
  private final ReservationRepository reservationRepository;
  private final FactureRepository factureRepository;

  public DashboardAlertsResponse getAlerts() {
    LocalDate today = LocalDate.now();

    List<DashboardVehicleAlertItem> maintenance = vehiculeRepository.findByStatut(VehiculeStatut.EN_MAINTENANCE)
        .stream()
        .map((vehicule) -> toVehicleAlert(vehicule, computeSinceLastVidange(vehicule)))
        .toList();

    List<DashboardVehicleAlertItem> vidangeAlerts = vehiculeRepository.findAll().stream()
        .filter(this::needsVidangeAlert)
        .map((vehicule) -> toVehicleAlert(vehicule, computeSinceLastVidange(vehicule)))
        .toList();

    List<DashboardReservationAlertItem> upcoming = reservationRepository
        .findUpcomingEndingReservations(today, today.plusDays(3))
        .stream()
        .map((reservation) -> toReservationAlert(reservation, null))
        .toList();

    List<DashboardReservationAlertItem> finishedInvoiced = factureRepository.findAllWithRelations().stream()
        .filter((facture) -> facture.getReservation().getStatut() == com.agence.location.reservation.ReservationStatus.TERMINEE)
        .map((facture) -> toReservationAlert(facture.getReservation(), facture))
        .toList();

    return new DashboardAlertsResponse(maintenance, vidangeAlerts, upcoming, finishedInvoiced);
  }

  private DashboardVehicleAlertItem toVehicleAlert(Vehicule vehicule, Long sinceLastVidange) {
    return new DashboardVehicleAlertItem(
        vehicule.getId(),
        vehicule.getImmatriculation(),
        vehicule.getMarque(),
        vehicule.getModele(),
        vehicule.getStatut(),
        vehicule.getKilometrage(),
        sinceLastVidange
    );
  }

  private DashboardReservationAlertItem toReservationAlert(Reservation reservation, Facture facture) {
    return new DashboardReservationAlertItem(
        reservation.getId(),
        reservation.getVehicule().getId(),
        reservation.getVehicule().getImmatriculation() + " - " + reservation.getVehicule().getMarque() + " " + reservation.getVehicule().getModele(),
        reservation.getClient().getId(),
        reservation.getClient().getNom(),
        reservation.getDateDebut(),
        reservation.getDateFin(),
        reservation.getStatut(),
        reservation.getPrixEstime(),
        facture == null ? null : facture.getDateEmission()
    );
  }

  private boolean needsVidangeAlert(Vehicule vehicule) {
    Long since = computeSinceLastVidange(vehicule);
    return since != null && since >= VIDANGE_ALERT_THRESHOLD_KM;
  }

  private Long computeSinceLastVidange(Vehicule vehicule) {
    if (vehicule.getDerniereVidangeKm() == null || vehicule.getKilometrage() == null) {
      return null;
    }
    return Math.max(0L, vehicule.getKilometrage() - vehicule.getDerniereVidangeKm());
  }
}
