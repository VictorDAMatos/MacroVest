package br.edu.vault.api.clientes;

import br.edu.vault.api.dto.EventoInesperadoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
@RequiredArgsConstructor
public class FonteEventosHttp implements FonteDados<List<EventoInesperadoDTO>> {

    private final RestClient dadosRestClient;

    @Override
    public List<EventoInesperadoDTO> obterDados() {
        return dadosRestClient.get()
                .uri("/eventos")
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }
}