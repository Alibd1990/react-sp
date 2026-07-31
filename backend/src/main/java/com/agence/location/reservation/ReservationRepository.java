package com.agence.location.reservation;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    boolean existsByVehiculeId(Long vehiculeId);

  @Query("""
      select case when count(r) > 0 then true else false end
      from Reservation r
      where r.vehicule.id = :vehiculeId
            and r.statut in (
                com.agence.location.reservation.ReservationStatus.CONFIRMEE,
                com.agence.location.reservation.ReservationStatus.EN_COURS
            )
      and (:dateDebut <= r.dateFin and :dateFin >= r.dateDebut)
      """)
  boolean existsConflictingReservation(
      @Param("vehiculeId") Long vehiculeId,
      @Param("dateDebut") LocalDate dateDebut,
      @Param("dateFin") LocalDate dateFin
  );

  @Query("""
      select case when count(r) > 0 then true else false end
      from Reservation r
      where r.id <> :id
      and r.vehicule.id = :vehiculeId
            and r.statut in (
                com.agence.location.reservation.ReservationStatus.CONFIRMEE,
                com.agence.location.reservation.ReservationStatus.EN_COURS
            )
      and (:dateDebut <= r.dateFin and :dateFin >= r.dateDebut)
      """)
  boolean existsConflictingReservationExcludingId(
      @Param("id") Long id,
      @Param("vehiculeId") Long vehiculeId,
      @Param("dateDebut") LocalDate dateDebut,
      @Param("dateFin") LocalDate dateFin
  );

  @Query("""
      select distinct r.vehicule.id
      from Reservation r
            where r.statut in (
                com.agence.location.reservation.ReservationStatus.CONFIRMEE,
                com.agence.location.reservation.ReservationStatus.EN_COURS
            )
      and (:dateDebut <= r.dateFin and :dateFin >= r.dateDebut)
      """)
  List<Long> findReservedVehiculeIds(@Param("dateDebut") LocalDate dateDebut, @Param("dateFin") LocalDate dateFin);
}
