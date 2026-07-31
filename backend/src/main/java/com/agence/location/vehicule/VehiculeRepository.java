package com.agence.location.vehicule;

import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VehiculeRepository extends JpaRepository<Vehicule, Long> {

  List<Vehicule> findByStatut(VehiculeStatut statut);

  boolean existsByImmatriculation(String immatriculation);

  boolean existsByImmatriculationAndIdNot(String immatriculation, Long id);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select v from Vehicule v where v.id = :id")
  Optional<Vehicule> findLockedById(@Param("id") Long id);
}
