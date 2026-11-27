package br.edu.vault.simulador.dominio;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class Divida {
    private final String descricao;
    private final double valorParcela;
    private final int parcelasRestantes;

    /**
     * Retorna o valor da parcela caso a dívida ainda esteja ativa no mês simulado.
     */
    public double calcularParcelaNoMes(int mesAtual) {
        return mesAtual <= parcelasRestantes ? valorParcela : 0.0;
    }
}