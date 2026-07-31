package com.agence.location.facture;

import com.agence.location.common.exception.BusinessException;
import com.agence.location.reservation.Reservation;
import com.agence.location.reservation.ReservationRepository;
import com.agence.location.reservation.ReservationStatus;
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

  private void apply(Facture facture, FactureRequest request) {
    Reservation reservation = reservationRepository.findById(request.reservationId())
        .orElseThrow(() -> new BusinessException("Reservation introuvable"));

    if (reservation.getStatut() != ReservationStatus.CLOTUREE) {
      throw new BusinessException("Facturation autorisee uniquement pour une reservation cloturee");
    }

    facture.setReservation(reservation);
    facture.setDateEmission(request.dateEmission());
    facture.setMontantTnd(request.montantTnd());
    facture.setStatut(request.statut());
    facture.setNotes(request.notes() == null ? null : request.notes().trim());
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
