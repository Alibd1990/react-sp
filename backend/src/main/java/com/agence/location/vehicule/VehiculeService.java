package com.agence.location.vehicule;

import com.agence.location.common.exception.BusinessException;
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

  public List<Vehicule> findDisponibles(LocalDate debut, LocalDate fin) {
    LocalDate now = LocalDate.now();
    List<Long> reservedIds = reservationRepository.findReservedVehiculeIds(debut, fin);
    return vehiculeRepository.findAll().stream()
        .filter(v -> v.getStatut() == VehiculeStatut.DISPONIBLE)
      .filter(v -> isDateValid(v.getAssuranceExpiration(), now))
      .filter(v -> isDateValid(v.getControleTechniqueExpiration(), now))
        .filter(v -> !reservedIds.contains(v.getId()))
        .toList();
  }

  public Vehicule create(VehiculeRequest request) {
    if (vehiculeRepository.existsByImmatriculation(request.immatriculation())) {
      throw new BusinessException("Immatriculation deja utilisee");
    }

    Vehicule vehicule = new Vehicule();
    apply(vehicule, request);
    return vehiculeRepository.save(vehicule);
  }

  public Vehicule update(Long id, VehiculeRequest request) {
    Vehicule vehicule = vehiculeRepository.findById(id)
        .orElseThrow(() -> new BusinessException("Vehicule introuvable"));

    if (vehiculeRepository.existsByImmatriculationAndIdNot(request.immatriculation(), id)) {
      throw new BusinessException("Immatriculation deja utilisee");
    }

    apply(vehicule, request);
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

  private void apply(Vehicule vehicule, VehiculeRequest request) {
    vehicule.setImmatriculation(request.immatriculation().trim());
    vehicule.setMarque(request.marque().trim());
    vehicule.setModele(request.modele().trim());
    vehicule.setAnnee(request.annee());
    vehicule.setKilometrage(request.kilometrage());
    vehicule.setCategorie(request.categorie().trim());
    vehicule.setCouleur(request.couleur().trim());
    vehicule.setTarifJour(BigDecimal.ZERO);
    vehicule.setAssuranceExpiration(request.assuranceExpiration());
    vehicule.setControleTechniqueExpiration(request.controleTechniqueExpiration());
    vehicule.setProchainEntretienKm(request.prochainEntretienKm());
    vehicule.setProchaineMaintenanceDate(request.prochaineMaintenanceDate());

    VehiculeStatut resolved = request.statut();
    LocalDate today = LocalDate.now();
    if (request.assuranceExpiration() != null && request.assuranceExpiration().isBefore(today)) {
      resolved = VehiculeStatut.HORS_SERVICE;
    } else if (request.controleTechniqueExpiration() != null && request.controleTechniqueExpiration().isBefore(today)) {
      resolved = VehiculeStatut.HORS_SERVICE;
    } else if (request.prochainEntretienKm() != null && request.kilometrage() >= request.prochainEntretienKm()) {
      resolved = VehiculeStatut.EN_MAINTENANCE;
    } else if (request.prochaineMaintenanceDate() != null && !request.prochaineMaintenanceDate().isAfter(today)) {
      resolved = VehiculeStatut.EN_MAINTENANCE;
    }
    vehicule.setStatut(resolved);
  }

  private boolean isDateValid(LocalDate expiration, LocalDate now) {
    return expiration == null || !expiration.isBefore(now);
  }
}
