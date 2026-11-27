package br.edu.vault.api.clientes;

import br.edu.vault.api.dto.EventoInesperadoDTO;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class FonteEventosHttp implements FonteDados<List<EventoInesperadoDTO>> {

    private final RestClient dadosRestClient;

    @Override
    @CircuitBreaker(name = "vaultDadosCB", fallbackMethod = "fallbackEventos")
    @Retry(name = "vaultDadosRetry")
    public List<EventoInesperadoDTO> obterDados() {
        log.debug("[HTTP] Consultando /eventos no vault-dados...");
        return dadosRestClient.get()
                .uri("/eventos")
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    public List<EventoInesperadoDTO> fallbackEventos(Throwable ex) {
        log.warn("[RESILIENCE4J - FALLBACK] Lista vazia de eventos acionada. Motivo: {}", ex.toString());
        return List.of();
    }
}