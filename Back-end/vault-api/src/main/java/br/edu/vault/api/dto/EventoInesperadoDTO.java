package br.edu.vault.api.dto;

public record EventoInesperadoDTO(int mesOcorrencia,
                                  String descricao,
                                  double impactoFinanceiro) {
}
