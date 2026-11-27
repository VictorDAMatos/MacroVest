package br.edu.vault.simulador.dto;


public record CalculoRequestDTO(PerfilDTO perfil,
                                String tipoPolitica, // "PADRAO", "ECONOMICA", "EMERGENCIA"
                                InflacaoDTO inflacao,
                                java.util.List<EventoInesperadoDTO> eventos) {
}
