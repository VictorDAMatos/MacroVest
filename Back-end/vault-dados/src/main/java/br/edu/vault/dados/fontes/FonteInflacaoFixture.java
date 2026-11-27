package br.edu.vault.dados.fontes;

import br.edu.vault.dados.dto.InflacaoDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;

@Component
@RequiredArgsConstructor
public class FonteInflacaoFixture implements FonteDados<InflacaoDTO> {

    private final ObjectMapper objectMapper;
    private InflacaoDTO cacheInflacao;

    @PostConstruct
    public void carregarFixture() {
        ClassPathResource resource = new ClassPathResource("fixtures/inflacao.json");
        try (InputStream is = resource.getInputStream()) {
            this.cacheInflacao = objectMapper.readValue(is, InflacaoDTO.class);
        } catch (IOException e) {
            throw new IllegalStateException("Falha ao carregar fixture fixtures/inflacao.json", e);
        }
    }

    @Override
    public InflacaoDTO obterDados() {
        return cacheInflacao;
    }
}