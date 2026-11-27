package br.edu.vault.simulador.politicas;

import br.edu.vault.simulador.dominio.PerfilFinanceiro;

public class PoliticaEmergencia implements PoliticaConsumo {

    @Override
    public String getNome() {
        return "EMERGENCIA";
    }

    @Override
    public double calcularGastoBaseMensal(PerfilFinanceiro perfil, int mesAtual) {
        double fixas = perfil.getDespesasFixas() * 0.85;       // Redução de 15% nas despesas fixas
        double variaveis = perfil.getDespesasVariaveis() * 0.15; // Corte de 85% nos gastos variáveis
        double dividas = perfil.calcularTotalDividasNoMes(mesAtual);
        return fixas + variaveis + dividas;
    }
}