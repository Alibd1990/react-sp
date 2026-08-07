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
                com.agence.location.reservation.ReservationStatus.EN_ATTENTE,
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
                com.agence.location.reservation.ReservationStatus.EN_ATTENTE,
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
                com.agence.location.reservation.ReservationStatus.EN_ATTENTE,
                com.agence.location.reservation.ReservationStatus.CONFIRMEE,
                com.agence.location.reservation.ReservationStatus.EN_COURS
            )
      and (:dateDebut <= r.dateFin and :dateFin >= r.dateDebut)
      """)
  List<Long> findReservedVehiculeIds(@Param("dateDebut") LocalDate dateDebut, @Param("dateFin") LocalDate dateFin);

  @Query("""
      select case when count(r) > 0 then true else false end
      from Reservation r
      where r.vehicule.id = :vehiculeId
      and r.statut = com.agence.location.reservation.ReservationStatus.EN_COURS
      and :today between r.dateDebut and r.dateFin
      """)
  boolean existsActiveRentalOnDate(
      @Param("vehiculeId") Long vehiculeId,
      @Param("today") LocalDate today
  );

  @Query("""
      select case when count(r) > 0 then true else false end
      from Reservation r
      where r.vehicule.id = :vehiculeId
      and r.statut in (
          com.agence.location.reservation.ReservationStatus.EN_ATTENTE,
          com.agence.location.reservation.ReservationStatus.CONFIRMEE
      )
      and r.dateFin >= :today
      """)
  boolean existsPlannedReservationFromDate(
      @Param("vehiculeId") Long vehiculeId,
      @Param("today") LocalDate today
  );

    @Query("""
            select r
            from Reservation r
            join fetch r.vehicule v
            join fetch r.client c
            where v.id = :vehiculeId
            order by r.dateDebut desc, r.id desc
            """)
    List<Reservation> findHistoriqueByVehiculeId(@Param("vehiculeId") Long vehiculeId);

    @Query("""
            select r
            from Reservation r
            join fetch r.vehicule v
            join fetch r.client c
            where r.statut in (
                com.agence.location.reservation.ReservationStatus.CONFIRMEE,
                com.agence.location.reservation.ReservationStatus.EN_COURS
            )
            and r.dateFin <= :today
            """)
    List<Reservation> findDueForAutoCompletion(@Param("today") LocalDate today);

    @Query("""
            select r
            from Reservation r
            join fetch r.vehicule v
            join fetch r.client c
            where r.statut in (
                com.agence.location.reservation.ReservationStatus.CONFIRMEE,
                com.agence.location.reservation.ReservationStatus.EN_COURS,
                com.agence.location.reservation.ReservationStatus.EN_ATTENTE
            )
            and r.dateFin between :today and :limitDate
            order by r.dateFin asc, r.id asc
            """)
    List<Reservation> findUpcomingEndingReservations(@Param("today") LocalDate today, @Param("limitDate") LocalDate limitDate);

    @Query("""
            select r
            from Reservation r
            join fetch r.vehicule v
            join fetch r.client c
            where r.statut = com.agence.location.reservation.ReservationStatus.TERMINEE
            and exists (
                select 1
                from Facture f
                where f.reservation = r
            )
            order by r.dateFin desc, r.id desc
            """)
    List<Reservation> findTermineesWithFacture();
}
