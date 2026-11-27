package br.edu.vault.dados.servico;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
public class SimuladorCaosService {

    @Value("${vault.caos.delay-ms:0}")
    private long delayPadraoMs;

    @Value("${vault.caos.taxa-erro:0.0}")
    private double taxaErroPadrao;

    public void aplicarInstabilidade(Long delayOverrideMs, Boolean forcarFalha) {
        long delayEfetivo = (delayOverrideMs != null && delayOverrideMs >= 0) ? delayOverrideMs : delayPadraoMs;

        if (delayEfetivo > 0) {
            log.warn("[CAOS] Simulando latência de {} ms no vault-dados...", delayEfetivo);
            try {
                Thread.sleep(delayEfetivo);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Thread interrompida durante simulação de atraso");
            }
        }

        boolean deveFalhar = Boolean.TRUE.equals(forcarFalha)
                || (taxaErroPadrao > 0.0 && ThreadLocalRandom.current().nextDouble() < taxaErroPadrao);

        if (deveFalhar) {
            log.error("[CAOS] Simulando falha HTTP 503 no vault-dados!");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Instabilidade simulada no serviço vault-dados");
        }
    }
}