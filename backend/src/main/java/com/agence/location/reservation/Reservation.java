package com.agence.location.reservation;

import com.agence.location.client.Client;
import com.agence.location.vehicule.Vehicule;
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
@Table(name = "reservations")
@Getter
@Setter
public class Reservation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "vehicule_id")
  private Vehicule vehicule;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "client_id")
  private Client client;

  @Column(name = "date_debut", nullable = false)
  private LocalDate dateDebut;

  @Column(name = "date_fin", nullable = false)
  private LocalDate dateFin;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ReservationStatus statut;

  @Column(name = "tarif_journalier", nullable = false)
  private BigDecimal tarifJournalier;

  @Column(name = "acompte_tnd", nullable = false)
  private BigDecimal acompteTnd;

  @Column(name = "caution_tnd", nullable = false)
  private BigDecimal cautionTnd;

  @Column(name = "prix_estime", nullable = false)
  private BigDecimal prixEstime;
}
