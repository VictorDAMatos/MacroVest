package br.edu.vault.simulador.controller;

import br.edu.vault.simulador.dto.CalculoRequestDTO;
import br.edu.vault.simulador.dto.SimulacaoResponseDTO;
import br.edu.vault.simulador.servico.MotorSimulacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class SimuladorController {

    private final MotorSimulacaoService motorService;

    @PostMapping("/calcular")
    public ResponseEntity<SimulacaoResponseDTO> calcular(@RequestBody CalculoRequestDTO request) {
        SimulacaoResponseDTO resultado = motorService.calcular(request);
        return ResponseEntity.ok(resultado);
    }
}