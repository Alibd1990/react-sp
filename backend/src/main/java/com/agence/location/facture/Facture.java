package com.agence.location.facture;

import com.agence.location.reservation.Reservation;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "factures")
@Getter
@Setter
public class Facture {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "reservation_id")
  private Reservation reservation;

  @Column(name = "date_emission", nullable = false)
  private LocalDate dateEmission;

  @Column(name = "montant_tnd", nullable = false)
  private BigDecimal montantTnd;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private FactureStatut statut;

  @Column(length = 500)
  private String notes;
}
