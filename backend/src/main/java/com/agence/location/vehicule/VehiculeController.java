package com.agence.location.vehicule;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/vehicules")
@RequiredArgsConstructor
public class VehiculeController {

  private final VehiculeService vehiculeService;

  @GetMapping
  public List<Vehicule> list() {
    return vehiculeService.findAll();
  }

  @GetMapping("/disponibilite")
  public List<Vehicule> disponibilite(
      @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
      @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin
  ) {
    return vehiculeService.findDisponibles(dateDebut, dateFin);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Vehicule create(@Valid @RequestBody VehiculeRequest request) {
    return vehiculeService.create(request);
  }

  @PutMapping("/{id}")
  public Vehicule update(@PathVariable Long id, @Valid @RequestBody VehiculeRequest request) {
    return vehiculeService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    vehiculeService.delete(id);
  }
}
