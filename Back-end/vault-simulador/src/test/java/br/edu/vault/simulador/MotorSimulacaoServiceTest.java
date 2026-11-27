package br.edu.vault.simulador;

import br.edu.vault.simulador.dto.*;
import br.edu.vault.simulador.politicas.PoliticaConsumoFactory;
import br.edu.vault.simulador.servico.MotorSimulacaoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MotorSimulacaoServiceTest {

    private MotorSimulacaoService motorService;

    @BeforeEach
    void setUp() {
        motorService = new MotorSimulacaoService(new PoliticaConsumoFactory());
    }

    @Test
    void deveCalcularSobrevivenciaMaiorNaPoliticaEconomicaQueNaPadrao() {
        PerfilDTO perfil = new PerfilDTO(
                1L, "Ana", 5000.0, 10000.0, 2000.0, 2000.0, List.of()
        );
        InflacaoDTO semInflacao = new InflacaoDTO("TESTE", 0.0, List.of(), false);

        // Na política PADRAO, gasto = 4000/mês -> 10000 / 4000 = 2 meses e 15 dias
        SimulacaoResponseDTO resPadrao = motorService.calcular(
                new CalculoRequestDTO(perfil, "PADRAO", semInflacao, List.of())
        );

        // Na política ECONOMICA, gasto = 2000 + (2000 * 0.5) = 3000/mês -> 10000 / 3000 = 3 meses e 10 dias
        SimulacaoResponseDTO resEconomica = motorService.calcular(
                new CalculoRequestDTO(perfil, "ECONOMICA", semInflacao, List.of())
        );

        assertEquals(2, resPadrao.mesesSobrevivencia());
        assertEquals(15, resPadrao.diasAdicionais());

        assertEquals(3, resEconomica.mesesSobrevivencia());
        assertEquals(10, resEconomica.diasAdicionais());
    }

    @Test
    void deveDescontarEventosInesperadosNoMesDeOcorrencia() {
        PerfilDTO perfil = new PerfilDTO(
                1L, "Carlos", 5000.0, 6000.0, 2000.0, 0.0, List.of()
        );
        InflacaoDTO semInflacao = new InflacaoDTO("TESTE", 0.0, List.of(), false);
        List<EventoInesperadoDTO> eventos = List.of(
                new EventoInesperadoDTO(2, "Reparo Carro", 2000.0)
        );

        // Mês 1: gasta 2000 (sobra 4000)
        // Mês 2: gasta 2000 + 2000 evento = 4000 (sobra 0) -> Exatos 2 meses e 0 dias
        SimulacaoResponseDTO res = motorService.calcular(
                new CalculoRequestDTO(perfil, "PADRAO", semInflacao, eventos)
        );

        assertEquals(2, res.mesesSobrevivencia());
        assertEquals(0, res.diasAdicionais());
        assertEquals(2000.0, res.evolucaoMensal().get(1).impactoEventos());
    }
}