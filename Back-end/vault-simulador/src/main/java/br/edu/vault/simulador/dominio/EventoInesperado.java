package br.edu.vault.simulador.dominio;

public record EventoInesperado(
        int mesOcorrencia,
        String descricao,
        double impactoFinanceiro
) {}