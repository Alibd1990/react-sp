package com.agence.location.vehicule;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "vehicules")
@Getter
@Setter
public class Vehicule {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String immatriculation;

  @Column(nullable = false)
  private String marque;

  @Column(nullable = false)
  private String modele;

  @Column(nullable = false)
  private Integer annee;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private VehiculeStatut statut;

  @Column(nullable = false)
  private Long kilometrage;
  @Column(nullable = false)
  private String couleur;

  @Column(name = "tarif_jour", nullable = false)
  private BigDecimal tarifJour;

  @Column(name = "assurance_expiration")
  private LocalDate assuranceExpiration;

  @Column(name = "controle_technique_expiration")
  private LocalDate controleTechniqueExpiration;

  @Column(name = "prochain_entretien_km")
  private Long prochainEntretienKm;

  @Column(name = "derniere_vidange_km")
  private Long derniereVidangeKm;

  @Column(name = "derniere_vidange_date")
  private LocalDate derniereVidangeDate;

  @Column(name = "prochaine_maintenance_date")
  private LocalDate prochaineMaintenanceDate;
}
