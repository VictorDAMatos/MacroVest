package br.edu.vault.simulador.dto;

public record InflacaoDTO(String fonte,
                          double taxaMensalMedia,
                          java.util.List<Double> projecaoMensal,
                          boolean fallbackAplicado) {
}
