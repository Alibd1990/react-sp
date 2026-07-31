package com.agence.location.facture;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface FactureRepository extends JpaRepository<Facture, Long> {

	@Query("""
			select f
			from Facture f
			join fetch f.reservation r
			join fetch r.vehicule
			join fetch r.client
			""")
	List<Facture> findAllWithRelations();
}
