package br.edu.vault.simulador.dominio;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class PerfilFinanceiro {
    private final Long id;
    private final String nome;
    private final double rendaMensal;
    private final double reservaTotal;
    private final double despesasFixas;
    private final double despesasVariaveis;
    private final List<Divida> dividas;

    public double calcularTotalDividasNoMes(int mesAtual) {
        if (dividas == null || dividas.isEmpty()) {
            return 0.0;
        }
        return dividas.stream()
                .mapToDouble(d -> d.calcularParcelaNoMes(mesAtual))
                .sum();
    }
}