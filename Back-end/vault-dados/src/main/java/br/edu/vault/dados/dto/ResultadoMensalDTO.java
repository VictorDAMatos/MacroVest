package br.edu.vault.dados.dto;

public record ResultadoMensalDTO(int mes,
                                 double saldoInicial,
                                 double gastoCalculado,
                                 double impactoEventos,
                                 double saldoFinal,
                                 String observacao) {
}
