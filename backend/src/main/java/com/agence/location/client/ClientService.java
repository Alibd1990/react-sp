package com.agence.location.client;

import com.agence.location.common.exception.BusinessException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientService {

  private final ClientRepository clientRepository;

  public List<Client> findAll() {
    return clientRepository.findAll();
  }

  public Client create(ClientRequest request) {
    if (clientRepository.existsByEmail(request.email())) {
      throw new BusinessException("Email client deja utilise");
    }
    if (clientRepository.existsByCin(request.cin())) {
      throw new BusinessException("CIN client deja utilise");
    }
    Client client = new Client();
    apply(client, request);
    return clientRepository.save(client);
  }

  public Client update(Long id, ClientRequest request) {
    Client client = clientRepository.findById(id)
        .orElseThrow(() -> new BusinessException("Client introuvable"));

    if (clientRepository.existsByEmailAndIdNot(request.email(), id)) {
      throw new BusinessException("Email client deja utilise");
    }
    if (clientRepository.existsByCinAndIdNot(request.cin(), id)) {
      throw new BusinessException("CIN client deja utilise");
    }

    apply(client, request);
    return clientRepository.save(client);
  }

  public void delete(Long id) {
    Client client = clientRepository.findById(id)
        .orElseThrow(() -> new BusinessException("Client introuvable"));
    clientRepository.delete(client);
  }

  private void apply(Client client, ClientRequest request) {
    client.setType(request.type());
    client.setNom(request.nom().trim());
    client.setEmail(request.email().trim().toLowerCase());
    client.setCin(request.cin().trim().toUpperCase());
    client.setPermisNumero(request.permisNumero().trim());
    client.setPermisExpiration(request.permisExpiration());
    client.setBlackliste(request.blackliste());
  }
}
