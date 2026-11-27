package br.edu.vault.api.controller;

import br.edu.vault.api.dto.SimulacaoRequestDTO;
import br.edu.vault.api.dto.SimulacaoResponseDTO;
import br.edu.vault.api.servico.IdempotenciaService;
import br.edu.vault.api.servico.OrquestradorSimulacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
public class SimulacaoController {

    private final OrquestradorSimulacaoService orquestradorService;
    private final IdempotenciaService idempotenciaService;

    @PostMapping("/perfis/{id}/simulacoes")
    public ResponseEntity<SimulacaoResponseDTO> criarSimulacao(
            @PathVariable("id") Long perfilId,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody(required = false) SimulacaoRequestDTO request
    ) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O cabeçalho 'Idempotency-Key' é obrigatório para executar simulações."
            );
        }

        // 1. Verifica se essa chave já foi processada anteriormente
        Optional<SimulacaoResponseDTO> existente = idempotenciaService.buscarSimulacaoExistente(idempotencyKey, perfilId);
        if (existente.isPresent()) {
            return ResponseEntity.ok()
                    .header("X-Idempotency-Hit", "true")
                    .body(existente.get());
        }

        // 2. Caso seja uma chave inédita, executa a simulação completa
        String politica = (request != null && request.tipoPolitica() != null)
                ? request.tipoPolitica()
                : "PADRAO";

        boolean incluirEventos = (request == null || request.incluirEventosInesperados() == null)
                || request.incluirEventosInesperados();

        SimulacaoResponseDTO resultado = orquestradorService.executarSimulacao(
                perfilId,
                politica,
                incluirEventos,
                idempotencyKey
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .header("X-Idempotency-Hit", "false")
                .body(resultado);
    }

    @GetMapping("/simulacoes/{id}")
    public ResponseEntity<SimulacaoResponseDTO> buscarSimulacao(@PathVariable("id") Long simulacaoId) {
        return ResponseEntity.ok(orquestradorService.buscarPorId(simulacaoId));
    }
}