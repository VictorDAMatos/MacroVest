package br.edu.vault.simulador.dominio;

public record ResultadoMensal(
        int mes,
        double saldoInicial,
        double gastoCalculado,
        double impactoEventos,
        double saldoFinal,
        String observacao
) {}