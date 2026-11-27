package br.edu.vault.simulador.servico;

import br.edu.vault.simulador.dominio.Divida;
import br.edu.vault.simulador.dominio.PerfilFinanceiro;
import br.edu.vault.simulador.dto.*;
import br.edu.vault.simulador.politicas.PoliticaConsumo;
import br.edu.vault.simulador.politicas.PoliticaConsumoFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MotorSimulacaoService {

    private static final int LIMITE_MAXIMO_MESES = 600;
    private final PoliticaConsumoFactory politicaFactory;

    public SimulacaoResponseDTO calcular(CalculoRequestDTO request) {
        long inicioNs = System.nanoTime();

        PerfilFinanceiro perfil = converterParaDominio(request.perfil());
        PoliticaConsumo politica = politicaFactory.obter(request.tipoPolitica());

        double saldoAtual = perfil.getReservaTotal();
        double fatorInflacaoAcumulada = 1.0;
        int mesesCompletos = 0;
        int diasAdicionais = 0;

        List<ResultadoMensalDTO> evolucaoMensal = new ArrayList<>();
        List<EventoInesperadoDTO> eventos = request.eventos() != null ? request.eventos() : List.of();

        for (int mes = 1; mes <= LIMITE_MAXIMO_MESES && saldoAtual > 0; mes++) {
            double saldoInicial = saldoAtual;

            // 1. Atualiza o fator de inflação composta do mês
            double taxaInflacaoMes = obterTaxaInflacaoDoMes(request.inflacao(), mes);
            fatorInflacaoAcumulada *= (1.0 + taxaInflacaoMes);

            // 2. Aplica a política escolhida e corrige pela inflação
            double gastoBase = politica.calcularGastoBaseMensal(perfil, mes);
            double gastoCorrigido = arredondar(gastoBase * fatorInflacaoAcumulada);

            // 3. Soma impactos de eventos inesperados ocorridos neste mês
            final int mesCorrente = mes;
            List<EventoInesperadoDTO> eventosDoMes = eventos.stream()
                    .filter(e -> e.mesOcorrencia() == mesCorrente)
                    .toList();

            double impactoEventos = arredondar(eventosDoMes.stream()
                    .mapToDouble(EventoInesperadoDTO::impactoFinanceiro)
                    .sum());

            double gastoTotalMes = arredondar(gastoCorrigido + impactoEventos);

            // 4. Verifica se o saldo cobre o mês inteiro ou apenas uma fração de dias
            if (saldoInicial >= gastoTotalMes) {
                saldoAtual = arredondar(saldoInicial - gastoTotalMes);
                mesesCompletos++;

                String obs = eventosDoMes.isEmpty()
                        ? "Mês coberto integralmente"
                        : "Eventos aplicados: " + eventosDoMes.stream().map(EventoInesperadoDTO::descricao).toList();

                evolucaoMensal.add(new ResultadoMensalDTO(
                        mes, saldoInicial, gastoCorrigido, impactoEventos, saldoAtual, obs
                ));
            } else {
                // Reserva insuficiente para fechar o mês: calcula dias proporcionais (base 30 dias)
                double proporcao = gastoTotalMes > 0 ? (saldoInicial / gastoTotalMes) : 0.0;
                diasAdicionais = (int) Math.floor(proporcao * 30.0);
                saldoAtual = 0.0;

                evolucaoMensal.add(new ResultadoMensalDTO(
                        mes, saldoInicial, gastoCorrigido, impactoEventos, 0.0,
                        String.format("Reserva esgotada após %d dias deste mês", diasAdicionais)
                ));
                break;
            }
        }

        long tempoProcessamentoMs = (System.nanoTime() - inicioNs) / 1_000_000L;
        boolean houveTimeout = request.inflacao() != null && request.inflacao().fallbackAplicado();

        return new SimulacaoResponseDTO(
                null, // Será preenchido pelo vault-api ao salvar no banco
                perfil.getId(),
                politica.getNome(),
                mesesCompletos,
                diasAdicionais,
                houveTimeout,
                tempoProcessamentoMs,
                evolucaoMensal
        );
    }

    private double obterTaxaInflacaoDoMes(InflacaoDTO inflacao, int mes) {
        if (inflacao == null) {
            return 0.0;
        }
        List<Double> projecao = inflacao.projecaoMensal();
        if (projecao != null && (mes - 1) < projecao.size()) {
            return projecao.get(mes - 1);
        }
        return inflacao.taxaMensalMedia();
    }

    private PerfilFinanceiro converterParaDominio(PerfilDTO dto) {
        List<Divida> dividas = dto.dividas() == null ? List.of() : dto.dividas().stream()
                .map(d -> new Divida(d.descricao(), d.valorParcela(), d.parcelasRestantes()))
                .toList();

        return new PerfilFinanceiro(
                dto.id(),
                dto.nome(),
                dto.rendaMensal(),
                dto.reservaTotal(),
                dto.despesasFixas(),
                dto.despesasVariaveis(),
                dividas
        );
    }

    private double arredondar(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }
}