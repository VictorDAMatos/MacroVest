package br.edu.vault.api.dto;

public record PerfilDTO(Long id,
                        String nome,
                        double rendaMensal,
                        double reservaTotal,
                        double despesasFixas,
                        double despesasVariaveis,
                        java.util.List<DividaDTO> dividas) {
}
