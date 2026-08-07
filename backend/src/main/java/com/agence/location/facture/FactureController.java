package com.agence.location.facture;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/factures")
@RequiredArgsConstructor
public class FactureController {

  private final FactureService factureService;

  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN','AGENT')")
  public List<FactureResponse> list() {
    return factureService.findAll();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasAnyRole('ADMIN','AGENT')")
  public FactureResponse create(@Valid @RequestBody FactureRequest request) {
    return factureService.create(request);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','AGENT')")
  public FactureResponse update(@PathVariable Long id, @Valid @RequestBody FactureRequest request) {
    return factureService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @PreAuthorize("hasAnyRole('ADMIN','AGENT')")
  public void delete(@PathVariable Long id) {
    factureService.delete(id);
  }

  @PostMapping("/auto-generate")
  @PreAuthorize("hasAnyRole('ADMIN','AGENT')")
  public Map<String, Integer> autoGenerate() {
    int generated = factureService.generateAutomaticFactures(LocalDate.now());
    return Map.of("generated", generated);
  }
}
