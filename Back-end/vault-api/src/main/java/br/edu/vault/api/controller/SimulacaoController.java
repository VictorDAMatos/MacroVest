package br.edu.vault.api.controller;

import br.edu.vault.api.dto.SimulacaoRequestDTO;
import br.edu.vault.api.dto.SimulacaoResponseDTO;
import br.edu.vault.api.servico.OrquestradorSimulacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class SimulacaoController {

    private final OrquestradorSimulacaoService orquestradorService;

    @PostMapping("/perfis/{id}/simulacoes")
    public ResponseEntity<SimulacaoResponseDTO> criarSimulacao(
            @PathVariable("id") Long perfilId,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody(required = false) SimulacaoRequestDTO request
    ) {
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

        return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
    }

    @GetMapping("/simulacoes/{id}")
    public ResponseEntity<SimulacaoResponseDTO> buscarSimulacao(@PathVariable("id") Long simulacaoId) {
        return ResponseEntity.ok(orquestradorService.buscarPorId(simulacaoId));
    }
}