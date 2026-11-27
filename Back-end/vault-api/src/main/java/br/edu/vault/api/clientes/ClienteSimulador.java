package br.edu.vault.api.clientes;

import br.edu.vault.api.dto.CalculoRequestDTO;
import br.edu.vault.api.dto.SimulacaoResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class ClienteSimulador {

    private final RestClient simuladorRestClient;

    public SimulacaoResponseDTO calcular(CalculoRequestDTO request) {
        return simuladorRestClient.post()
                .uri("/calcular")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(SimulacaoResponseDTO.class);
    }
}