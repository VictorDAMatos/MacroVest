package br.edu.vault.simulador.politicas;

import br.edu.vault.simulador.dominio.PerfilFinanceiro;

public class PoliticaPadrao implements PoliticaConsumo {

    @Override
    public String getNome() {
        return "PADRAO";
    }

    @Override
    public double calcularGastoBaseMensal(PerfilFinanceiro perfil, int mesAtual) {
        double fixas = perfil.getDespesasFixas();
        double variaveis = perfil.getDespesasVariaveis();
        double dividas = perfil.calcularTotalDividasNoMes(mesAtual);
        return fixas + variaveis + dividas;
    }
}