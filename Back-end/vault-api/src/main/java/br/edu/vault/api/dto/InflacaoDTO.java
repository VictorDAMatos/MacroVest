package br.edu.vault.api.dto;

public record InflacaoDTO(String fonte,
                          double taxaMensalMedia,
                          java.util.List<Double> projecaoMensal,
                          boolean fallbackAplicado) {
}
