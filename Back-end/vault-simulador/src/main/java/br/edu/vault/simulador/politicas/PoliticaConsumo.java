package br.edu.vault.simulador.politicas;

import br.edu.vault.simulador.dominio.PerfilFinanceiro;

public interface PoliticaConsumo {
    String getNome();
    double calcularGastoBaseMensal(PerfilFinanceiro perfil, int mesAtual);
}