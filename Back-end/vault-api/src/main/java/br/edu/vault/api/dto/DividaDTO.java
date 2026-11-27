package br.edu.vault.api.dto;

public record DividaDTO(String descricao,
                        double valorParcela,
                        int parcelasRestantes) {
}
