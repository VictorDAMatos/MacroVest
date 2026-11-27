package br.edu.vault.dados.dto;

public record InflacaoDTO(String fonte,
                          double taxaMensalMedia,
                          java.util.List<Double> projecaoMensal,
                          boolean fallbackAplicado) {
}
