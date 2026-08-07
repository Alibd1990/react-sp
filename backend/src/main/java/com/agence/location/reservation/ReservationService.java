package com.agence.location.reservation;

import com.agence.location.client.Client;
import com.agence.location.client.ClientRepository;
import com.agence.location.common.exception.BusinessException;
import com.agence.location.vehicule.Vehicule;
import com.agence.location.vehicule.VehiculeRepository;
import com.agence.location.vehicule.VehiculeStatut;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReservationService {

  private static final long MIN_DURATION_DAYS = 1;
  private static final long MAX_DURATION_DAYS = 30;

  private final ReservationRepository reservationRepository;
  private final VehiculeRepository vehiculeRepository;
  private final ClientRepository clientRepository;

  public List<ReservationResponse> findAll() {
    return reservationRepository.findAll().stream().map(this::toResponse).toList();
  }

  @Transactional
  public ReservationResponse create(CreateReservationRequest request) {
    Reservation reservation = new Reservation();
    ReservationStatus status = ReservationStatus.EN_ATTENTE;
    apply(
        reservation,
        request.vehiculeId(),
        request.clientId(),
        request.dateDebut(),
        request.dateFin(),
        request.tarifJournalier(),
        request.acompteTnd(),
        request.cautionTnd(),
        request.kilometrageDepart(),
        request.kilometrageRetour(),
        status,
        null,
        null
    );
    Reservation saved = reservationRepository.save(reservation);
    return toResponse(saved);
  }

  @Transactional
  public ReservationResponse update(Long id, ReservationManageRequest request) {
    Reservation reservation = reservationRepository.findById(id)
        .orElseThrow(() -> new BusinessException("Reservation introuvable"));

    validateTransition(reservation.getStatut(), request.statut());
    if (reservation.getStatut() == ReservationStatus.EN_COURS && hasCoreChanges(reservation, request)) {
      throw new BusinessException("Modification interdite: reservation deja en cours");
    }

    apply(
        reservation,
        request.vehiculeId(),
        request.clientId(),
        request.dateDebut(),
        request.dateFin(),
        request.tarifJournalier(),
      request.acompteTnd(),
      request.cautionTnd(),
      request.kilometrageDepart(),
      request.kilometrageRetour(),
        request.statut(),
      id,
      reservation.getStatut()
    );

    Reservation saved = reservationRepository.save(reservation);
    return toResponse(saved);
  }

  @Transactional
  public void delete(Long id) {
    Reservation reservation = reservationRepository.findById(id)
        .orElseThrow(() -> new BusinessException("Reservation introuvable"));
    reservationRepository.delete(reservation);
  }

  private void apply(
      Reservation reservation,
      Long vehiculeId,
      Long clientId,
      LocalDate dateDebut,
      LocalDate dateFin,
      BigDecimal tarifJournalier,
      BigDecimal acompteTnd,
      BigDecimal cautionTnd,
      Long kilometrageDepart,
      Long kilometrageRetour,
      ReservationStatus statut,
      Long reservationIdForUpdate,
      ReservationStatus previousStatus
  ) {
    validateDates(dateDebut, dateFin);

    Vehicule vehicule = vehiculeRepository.findLockedById(vehiculeId)
        .orElseThrow(() -> new BusinessException("Vehicule introuvable"));
    Client client = clientRepository.findById(clientId)
        .orElseThrow(() -> new BusinessException("Client introuvable"));

    if (client.isBlackliste()) {
      throw new BusinessException("Client blacklisté");
    }

    if (client.getPermisExpiration().isBefore(LocalDate.now())) {
      throw new BusinessException("Permis expiré");
    }

    if (statut == ReservationStatus.CONFIRMEE && zeroIfNull(cautionTnd).compareTo(BigDecimal.ZERO) <= 0) {
      throw new BusinessException("Caution obligatoire pour confirmer la reservation");
    }

    if ((statut == ReservationStatus.EN_COURS || statut == ReservationStatus.TERMINEE || statut == ReservationStatus.CLOTUREE)
        && kilometrageDepart == null) {
      throw new BusinessException("Kilometrage depart obligatoire pour une reservation en cours/terminee");
    }
    if ((statut == ReservationStatus.TERMINEE || statut == ReservationStatus.CLOTUREE) && kilometrageRetour == null) {
      throw new BusinessException("Kilometrage retour obligatoire pour une reservation terminee/cloturee");
    }
    if (kilometrageDepart != null && kilometrageRetour != null && kilometrageRetour < kilometrageDepart) {
      throw new BusinessException("Kilometrage retour invalide (inferieur au kilometrage depart)");
    }

    if (vehicule.getStatut() == VehiculeStatut.EN_MAINTENANCE
        || vehicule.getStatut() == VehiculeStatut.HORS_SERVICE
        || vehicule.getStatut() == VehiculeStatut.RETIRE_DU_PARC) {
      throw new BusinessException("Vehicule indisponible (maintenance/hors service/retire)");
    }

    boolean creating = reservationIdForUpdate == null;
    if (creating && vehicule.getStatut() != VehiculeStatut.DISPONIBLE) {
      throw new BusinessException("Vehicule non reservable dans son statut actuel");
    }

    boolean conflict = reservationIdForUpdate == null
        ? reservationRepository.existsConflictingReservation(vehiculeId, dateDebut, dateFin)
        : reservationRepository.existsConflictingReservationExcludingId(reservationIdForUpdate, vehiculeId, dateDebut, dateFin);

    if (conflict && !isNonBlockingStatus(statut)) {
      throw new BusinessException("Double reservation detectee sur cette plage");
    }

    Vehicule previousVehicule = reservation.getVehicule();
    reservation.setVehicule(vehicule);
    reservation.setClient(client);
    reservation.setDateDebut(dateDebut);
    reservation.setDateFin(dateFin);
    reservation.setStatut(statut);
    reservation.setTarifJournalier(tarifJournalier);
    reservation.setAcompteTnd(zeroIfNull(acompteTnd));
    reservation.setCautionTnd(zeroIfNull(cautionTnd));
    reservation.setKilometrageDepart(kilometrageDepart);
    reservation.setKilometrageRetour(kilometrageRetour);
    reservation.setPrixEstime(computePrice(tarifJournalier, dateDebut, dateFin));

    syncVehiculeStatusAfterReservationChange(previousVehicule, previousStatus, vehicule, statut);
  }

  private void validateDates(LocalDate debut, LocalDate fin) {
    if (fin.isBefore(debut)) {
      throw new BusinessException("dateFin doit etre >= dateDebut");
    }
    long days = ChronoUnit.DAYS.between(debut, fin) + 1;
    if (days < MIN_DURATION_DAYS) {
      throw new BusinessException("Duree minimale: 1 jour");
    }
    if (days > MAX_DURATION_DAYS) {
      throw new BusinessException("Duree maximale depassee (30 jours)");
    }
  }

  private BigDecimal computePrice(BigDecimal tarifJour, LocalDate debut, LocalDate fin) {
    long days = ChronoUnit.DAYS.between(debut, fin) + 1;
    return tarifJour.multiply(BigDecimal.valueOf(days));
  }

  private BigDecimal zeroIfNull(BigDecimal value) {
    return value == null ? BigDecimal.ZERO : value;
  }

  private boolean isNonBlockingStatus(ReservationStatus statut) {
    return statut == ReservationStatus.ANNULEE || statut == ReservationStatus.NO_SHOW;
  }

  private boolean hasCoreChanges(Reservation reservation, ReservationManageRequest request) {
    return !reservation.getVehicule().getId().equals(request.vehiculeId())
        || !reservation.getClient().getId().equals(request.clientId())
        || !reservation.getDateDebut().equals(request.dateDebut())
        || !reservation.getDateFin().equals(request.dateFin());
  }

  private void validateTransition(ReservationStatus from, ReservationStatus to) {
    if (from == to) {
      return;
    }

    if (from == ReservationStatus.EN_ATTENTE
        && EnumSet.of(ReservationStatus.CONFIRMEE, ReservationStatus.ANNULEE, ReservationStatus.NO_SHOW).contains(to)) {
      return;
    }
    if (from == ReservationStatus.CONFIRMEE
        && EnumSet.of(ReservationStatus.EN_COURS, ReservationStatus.ANNULEE, ReservationStatus.NO_SHOW).contains(to)) {
      return;
    }
    if (from == ReservationStatus.EN_COURS && to == ReservationStatus.TERMINEE) {
      return;
    }
    if (from == ReservationStatus.TERMINEE && to == ReservationStatus.CLOTUREE) {
      return;
    }

    throw new BusinessException("Transition de statut invalide: " + from + " -> " + to);
  }

  private void syncVehiculeStatusAfterReservationChange(
      Vehicule previousVehicule,
      ReservationStatus previousStatus,
      Vehicule currentVehicule,
      ReservationStatus newStatus
  ) {
    if (previousVehicule != null && previousStatus != null && !previousVehicule.getId().equals(currentVehicule.getId())) {
      releaseVehiculeIfNeeded(previousVehicule, previousStatus);
    }

    if (newStatus == ReservationStatus.CONFIRMEE) {
      currentVehicule.setStatut(VehiculeStatut.RESERVE);
    } else if (newStatus == ReservationStatus.EN_COURS) {
      currentVehicule.setStatut(VehiculeStatut.EN_LOCATION);
    } else if (EnumSet.of(ReservationStatus.TERMINEE, ReservationStatus.ANNULEE, ReservationStatus.NO_SHOW, ReservationStatus.CLOTUREE)
        .contains(newStatus)) {
      releaseVehiculeIfNeeded(currentVehicule, newStatus);
    }
  }

  private void releaseVehiculeIfNeeded(Vehicule vehicule, ReservationStatus sourceStatus) {
    if (vehicule.getStatut() == VehiculeStatut.EN_MAINTENANCE
        || vehicule.getStatut() == VehiculeStatut.HORS_SERVICE
        || vehicule.getStatut() == VehiculeStatut.RETIRE_DU_PARC) {
      return;
    }
    if (sourceStatus == ReservationStatus.TERMINEE || sourceStatus == ReservationStatus.CLOTUREE) {
      vehicule.setStatut(VehiculeStatut.DISPONIBLE);
      return;
    }
    if (sourceStatus == ReservationStatus.ANNULEE || sourceStatus == ReservationStatus.NO_SHOW) {
      vehicule.setStatut(VehiculeStatut.DISPONIBLE);
    }
  }

  private ReservationResponse toResponse(Reservation reservation) {
    return new ReservationResponse(
        reservation.getId(),
        reservation.getVehicule().getId(),
        reservation.getClient().getId(),
        reservation.getDateDebut(),
        reservation.getDateFin(),
        reservation.getStatut(),
        reservation.getTarifJournalier(),
        reservation.getAcompteTnd(),
        reservation.getCautionTnd(),
        reservation.getKilometrageDepart(),
        reservation.getKilometrageRetour(),
        reservation.getPrixEstime()
    );
  }
}
