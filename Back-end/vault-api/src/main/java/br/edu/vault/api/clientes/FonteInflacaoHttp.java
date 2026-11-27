package br.edu.vault.api.clientes;

import br.edu.vault.api.dto.InflacaoDTO;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class FonteInflacaoHttp implements FonteDados<InflacaoDTO> {

    private final RestClient dadosRestClient;

    @Override
    @CircuitBreaker(name = "vaultDadosCB", fallbackMethod = "fallbackInflacao")
    @Retry(name = "vaultDadosRetry")
    public InflacaoDTO obterDados() {
        log.debug("[HTTP] Consultando /inflacao no vault-dados...");
        return dadosRestClient.get()
                .uri("/inflacao")
                .retrieve()
                .body(InflacaoDTO.class);
    }

    public InflacaoDTO fallbackInflacao(Throwable ex) {
        log.warn("[RESILIENCE4J - FALLBACK] Inflação padrão acionada. Motivo: {}", ex.toString());
        return new InflacaoDTO("FALLBACK_PADRAO_IPCA", 0.0040, List.of(), true);
    }
}