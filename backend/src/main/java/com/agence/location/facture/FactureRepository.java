package com.agence.location.facture;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface FactureRepository extends JpaRepository<Facture, Long> {

	boolean existsByReservationId(Long reservationId);

	@Query("""
			select f
			from Facture f
			join fetch f.reservation r
			join fetch r.vehicule
			join fetch r.client
			where r.id = :reservationId
			""")
	java.util.Optional<Facture> findByReservationIdWithRelations(@org.springframework.data.repository.query.Param("reservationId") Long reservationId);

	@Query("""
			select f
			from Facture f
			join fetch f.reservation r
			join fetch r.vehicule
			join fetch r.client
			""")
	List<Facture> findAllWithRelations();
}
