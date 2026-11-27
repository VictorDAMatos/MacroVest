package br.edu.vault.api.clientes;

import br.edu.vault.api.dto.InflacaoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class FonteInflacaoHttp implements FonteDados<InflacaoDTO> {

    private final RestClient dadosRestClient;

    @Override
    public InflacaoDTO obterDados() {
        return dadosRestClient.get()
                .uri("/inflacao")
                .retrieve()
                .body(InflacaoDTO.class);
    }
}