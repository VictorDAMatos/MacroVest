package br.edu.vault.api.dto;

public record ResultadoMensalDTO(int mes,
                                 double saldoInicial,
                                 double gastoCalculado,
                                 double impactoEventos,
                                 double saldoFinal,
                                 String observacao) {
}
