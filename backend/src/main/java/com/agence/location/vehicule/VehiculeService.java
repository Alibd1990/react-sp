package com.agence.location.vehicule;

import com.agence.location.common.exception.BusinessException;
import com.agence.location.reservation.Reservation;
import com.agence.location.reservation.ReservationRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VehiculeService {

  private final VehiculeRepository vehiculeRepository;
  private final ReservationRepository reservationRepository;

  public List<Vehicule> findAll() {
    return vehiculeRepository.findAll();
  }

  public List<VehiculeReservationHistoryItem> findReservationHistory(Long vehiculeId) {
    if (!vehiculeRepository.existsById(vehiculeId)) {
      throw new BusinessException("Vehicule introuvable");
    }

    List<Reservation> history = reservationRepository.findHistoriqueByVehiculeId(vehiculeId);
    return history.stream().map((reservation) -> new VehiculeReservationHistoryItem(
        reservation.getId(),
        reservation.getClient().getId(),
        reservation.getClient().getNom(),
        reservation.getDateDebut(),
        reservation.getDateFin(),
        reservation.getStatut(),
        reservation.getKilometrageDepart(),
        reservation.getKilometrageRetour(),
        reservation.getPrixEstime()
    )).toList();
  }

  public List<Vehicule> findDisponibles(LocalDate debut, LocalDate fin) {
    if (fin.isBefore(debut)) {
      throw new BusinessException("dateFin doit etre >= dateDebut");
    }

    LocalDate now = LocalDate.now();
    List<Long> reservedIds = reservationRepository.findReservedVehiculeIds(debut, fin);
    return vehiculeRepository.findAll().stream()
        .filter(this::isStatutEligibleForAvailability)
        .filter(v -> isDateValid(v.getAssuranceExpiration(), now))
        .filter(v -> isDateValid(v.getControleTechniqueExpiration(), now))
        .filter(v -> !reservedIds.contains(v.getId()))
        .toList();
  }

  private boolean isStatutEligibleForAvailability(Vehicule vehicule) {
    VehiculeStatut statut = vehicule.getStatut();
    return statut != VehiculeStatut.HORS_SERVICE
        && statut != VehiculeStatut.RETIRE_DU_PARC
        && statut != VehiculeStatut.EN_MAINTENANCE;
  }

  public Vehicule create(VehiculeRequest request) {
    if (vehiculeRepository.existsByImmatriculation(request.immatriculation())) {
      throw new BusinessException("Immatriculation deja utilisee");
    }

    Vehicule vehicule = new Vehicule();
    apply(vehicule, request, true);
    return vehiculeRepository.save(vehicule);
  }

  public Vehicule update(Long id, VehiculeRequest request) {
    Vehicule vehicule = vehiculeRepository.findById(id)
        .orElseThrow(() -> new BusinessException("Vehicule introuvable"));

    VehiculeStatut previousStatus = vehicule.getStatut();

    if (vehiculeRepository.existsByImmatriculationAndIdNot(request.immatriculation(), id)) {
      throw new BusinessException("Immatriculation deja utilisee");
    }

    apply(vehicule, request, false);
    if (previousStatus == VehiculeStatut.EN_MAINTENANCE
        && vehicule.getStatut() != VehiculeStatut.EN_MAINTENANCE
        && vehicule.getStatut() != VehiculeStatut.HORS_SERVICE
        && vehicule.getStatut() != VehiculeStatut.RETIRE_DU_PARC) {
      reconcileStatusAfterMaintenance(vehicule);
    }
    return vehiculeRepository.save(vehicule);
  }

  public void delete(Long id) {
    Vehicule vehicule = vehiculeRepository.findById(id)
        .orElseThrow(() -> new BusinessException("Vehicule introuvable"));
    if (reservationRepository.existsByVehiculeId(id)) {
      throw new BusinessException("Suppression impossible: vehicule avec historique de reservations");
    }
    vehiculeRepository.delete(vehicule);
  }

  private void apply(Vehicule vehicule, VehiculeRequest request, boolean creating) {
    vehicule.setImmatriculation(request.immatriculation().trim());
    vehicule.setMarque(request.marque().trim());
    vehicule.setModele(request.modele().trim());
    vehicule.setAnnee(request.annee());
    vehicule.setKilometrage(request.kilometrage());
    vehicule.setCouleur(request.couleur().trim());
    vehicule.setTarifJour(BigDecimal.ZERO);
    vehicule.setAssuranceExpiration(request.assuranceExpiration());
    vehicule.setControleTechniqueExpiration(request.controleTechniqueExpiration());
    Long prochainEntretienKm = request.prochainEntretienKm();
    if (prochainEntretienKm == null && request.derniereVidangeKm() != null) {
      prochainEntretienKm = request.derniereVidangeKm() + 5000;
    }
    vehicule.setProchainEntretienKm(prochainEntretienKm);
    vehicule.setDerniereVidangeKm(request.derniereVidangeKm());
    vehicule.setDerniereVidangeDate(request.derniereVidangeDate());
    vehicule.setProchaineMaintenanceDate(request.prochaineMaintenanceDate());

    VehiculeStatut resolved = request.statut() != null
        ? request.statut()
        : (creating ? VehiculeStatut.DISPONIBLE : vehicule.getStatut());
    vehicule.setStatut(resolved);
  }

  private boolean isDateValid(LocalDate expiration, LocalDate now) {
    return expiration == null || !expiration.isBefore(now);
  }

  private void reconcileStatusAfterMaintenance(Vehicule vehicule) {
    LocalDate today = LocalDate.now();
    boolean hasActiveRental = reservationRepository.existsActiveRentalOnDate(vehicule.getId(), today);
    if (hasActiveRental) {
      vehicule.setStatut(VehiculeStatut.EN_LOCATION);
      return;
    }

    boolean hasPlannedReservation = reservationRepository.existsPlannedReservationFromDate(vehicule.getId(), today);
    vehicule.setStatut(hasPlannedReservation ? VehiculeStatut.RESERVE : VehiculeStatut.DISPONIBLE);
  }
}
