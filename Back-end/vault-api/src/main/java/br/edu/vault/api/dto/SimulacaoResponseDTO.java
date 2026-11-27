package br.edu.vault.api.dto;

public record SimulacaoResponseDTO(Long simulacaoId,
                                   Long perfilId,
                                   String politicaAplicada,
                                   int mesesSobrevivencia,
                                   int diasAdicionais,
                                   boolean houveTimeoutDados,
                                   long tempoProcessamentoMs,
                                   java.util.List<ResultadoMensalDTO> evolucaoMensal) {
}
