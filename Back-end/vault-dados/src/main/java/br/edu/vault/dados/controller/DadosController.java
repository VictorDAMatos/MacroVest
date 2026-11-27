package br.edu.vault.dados.controller;

import br.edu.vault.dados.dto.EventoInesperadoDTO;
import br.edu.vault.dados.dto.InflacaoDTO;
import br.edu.vault.dados.fontes.FonteDados;
import br.edu.vault.dados.servico.SimuladorCaosService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DadosController {

    private final FonteDados<InflacaoDTO> fonteInflacao;
    private final FonteDados<List<EventoInesperadoDTO>> fonteEventos;
    private final SimuladorCaosService caosService;

    @GetMapping("/inflacao")
    public ResponseEntity<InflacaoDTO> obterInflacao(
            @RequestParam(required = false) Long delayMs,
            @RequestParam(required = false) Boolean falhar
    ) {
        caosService.aplicarInstabilidade(delayMs, falhar);
        return ResponseEntity.ok(fonteInflacao.obterDados());
    }

    @GetMapping("/eventos")
    public ResponseEntity<List<EventoInesperadoDTO>> obterEventos(
            @RequestParam(required = false) Long delayMs,
            @RequestParam(required = false) Boolean falhar
    ) {
        caosService.aplicarInstabilidade(delayMs, falhar);
        return ResponseEntity.ok(fonteEventos.obterDados());
    }
}