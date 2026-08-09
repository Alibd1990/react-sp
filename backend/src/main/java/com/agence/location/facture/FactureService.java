package com.agence.location.facture;

import com.agence.location.common.exception.BusinessException;
import com.agence.location.reservation.Reservation;
import com.agence.location.reservation.ReservationRepository;
import com.agence.location.reservation.ReservationStatus;
import com.agence.location.vehicule.Vehicule;
import com.agence.location.vehicule.VehiculeStatut;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FactureService {

  private final FactureRepository factureRepository;
  private final ReservationRepository reservationRepository;

  public List<FactureResponse> findAll() {
    return factureRepository.findAllWithRelations().stream().map(this::toResponse).toList();
  }

  @Transactional
  public FactureResponse create(FactureRequest request) {
    Facture facture = new Facture();
    apply(facture, request);
    return toResponse(factureRepository.save(facture));
  }

  @Transactional
  public FactureResponse update(Long id, FactureRequest request) {
    Facture facture = factureRepository.findById(id)
        .orElseThrow(() -> new BusinessException("Facture introuvable"));
    apply(facture, request);
    return toResponse(factureRepository.save(facture));
  }

  @Transactional
  public void delete(Long id) {
    Facture facture = factureRepository.findById(id)
        .orElseThrow(() -> new BusinessException("Facture introuvable"));
    factureRepository.delete(facture);
  }

  @Transactional
  public int generateAutomaticFactures(LocalDate today) {
    int generated = 0;
    List<Reservation> dueReservations = reservationRepository.findDueForAutoCompletion(today);
    for (Reservation reservation : dueReservations) {
      if (factureRepository.existsByReservationId(reservation.getId())) {
        if (reservation.getStatut() != ReservationStatus.TERMINEE) {
          reservation.setStatut(ReservationStatus.TERMINEE);
          releaseVehiculeIfAllowed(reservation.getVehicule());
        }
        continue;
      }

      reservation.setStatut(ReservationStatus.TERMINEE);
      releaseVehiculeIfAllowed(reservation.getVehicule());

      Facture facture = new Facture();
      facture.setReservation(reservation);
      facture.setDateEmission(today);
      facture.setMontantTnd(reservation.getPrixEstime());
      facture.setStatut(FactureStatut.EMISE);
      facture.setNotes(buildAutoInvoiceNotes(reservation));
      factureRepository.save(facture);
      generated++;
    }
    return generated;
  }

  @Transactional
  public void ensureAutomaticFactureForReservation(Reservation reservation, LocalDate today) {
    if (reservation.getStatut() != ReservationStatus.TERMINEE
        && reservation.getStatut() != ReservationStatus.CLOTUREE) {
      return;
    }

    if (factureRepository.existsByReservationId(reservation.getId())) {
      return;
    }

    Facture facture = new Facture();
    facture.setReservation(reservation);
    facture.setDateEmission(today);
    facture.setMontantTnd(reservation.getPrixEstime());
    facture.setStatut(FactureStatut.EMISE);
    facture.setNotes(buildAutoInvoiceNotes(reservation));
    factureRepository.save(facture);
  }

  private void apply(Facture facture, FactureRequest request) {
    Reservation reservation = reservationRepository.findById(request.reservationId())
        .orElseThrow(() -> new BusinessException("Reservation introuvable"));

    if (reservation.getStatut() != ReservationStatus.CLOTUREE
        && reservation.getStatut() != ReservationStatus.TERMINEE) {
      throw new BusinessException("Facturation autorisee uniquement pour une reservation terminee ou cloturee");
    }

    facture.setReservation(reservation);
    facture.setDateEmission(request.dateEmission());
    facture.setMontantTnd(request.montantTnd());
    facture.setStatut(request.statut());
    facture.setNotes(request.notes() == null ? null : request.notes().trim());
  }

  private String buildAutoInvoiceNotes(Reservation reservation) {
    return String.format(
        "Facture auto generee | Client=%s | Vehicule=%s | Periode=%s->%s | KmDepart=%s | KmRetour=%s",
        reservation.getClient().getNom(),
        reservation.getVehicule().getImmatriculation(),
        reservation.getDateDebut(),
        reservation.getDateFin(),
        reservation.getKilometrageDepart() == null ? "N/A" : reservation.getKilometrageDepart(),
        reservation.getKilometrageRetour() == null ? "N/A" : reservation.getKilometrageRetour()
    );
  }

  private void releaseVehiculeIfAllowed(Vehicule vehicule) {
    if (vehicule.getStatut() == VehiculeStatut.EN_MAINTENANCE
        || vehicule.getStatut() == VehiculeStatut.HORS_SERVICE
        || vehicule.getStatut() == VehiculeStatut.RETIRE_DU_PARC) {
      return;
    }
    vehicule.setStatut(VehiculeStatut.DISPONIBLE);
  }

  private FactureResponse toResponse(Facture facture) {
    Reservation reservation = facture.getReservation();
    return new FactureResponse(
        facture.getId(),
        reservation.getId(),
        reservation.getVehicule().getId(),
        reservation.getClient().getId(),
        facture.getDateEmission(),
        facture.getMontantTnd(),
        facture.getStatut(),
        facture.getNotes()
    );
  }
}
