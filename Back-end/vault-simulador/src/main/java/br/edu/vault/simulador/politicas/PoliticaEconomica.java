package br.edu.vault.simulador.politicas;

import br.edu.vault.simulador.dominio.PerfilFinanceiro;

public class PoliticaEconomica implements PoliticaConsumo {

    @Override
    public String getNome() {
        return "ECONOMICA";
    }

    @Override
    public double calcularGastoBaseMensal(PerfilFinanceiro perfil, int mesAtual) {
        double fixas = perfil.getDespesasFixas();
        double variaveis = perfil.getDespesasVariaveis() * 0.50; // Corte de 50% nos gastos variáveis
        double dividas = perfil.calcularTotalDividasNoMes(mesAtual);
        return fixas + variaveis + dividas;
    }
}