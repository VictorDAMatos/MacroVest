package br.edu.vault.dados.dto;

public record CalculoRequestDTO(PerfilDTO perfil,
                                String tipoPolitica, // "PADRAO", "ECONOMICA", "EMERGENCIA"
                                InflacaoDTO inflacao,
                                java.util.List<EventoInesperadoDTO> eventos) {
}
