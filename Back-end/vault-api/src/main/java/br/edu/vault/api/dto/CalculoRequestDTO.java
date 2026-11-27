package br.edu.vault.api.dto;

public record CalculoRequestDTO(PerfilDTO perfil,
                                String tipoPolitica, // "PADRAO", "ECONOMICA", "EMERGENCIA"
                                InflacaoDTO inflacao,
                                java.util.List<EventoInesperadoDTO> eventos) {
}
