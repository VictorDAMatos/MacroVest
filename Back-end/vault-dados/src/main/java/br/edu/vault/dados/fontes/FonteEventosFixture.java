package br.edu.vault.dados.fontes;

import br.edu.vault.dados.dto.EventoInesperadoDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Component
@RequiredArgsConstructor
public class FonteEventosFixture implements FonteDados<List<EventoInesperadoDTO>> {

    private final ObjectMapper objectMapper;
    private List<EventoInesperadoDTO> cacheEventos;

    @PostConstruct
    public void carregarFixture() {
        ClassPathResource resource = new ClassPathResource("fixtures/eventos.json");
        try (InputStream is = resource.getInputStream()) {
            this.cacheEventos = objectMapper.readValue(is, new TypeReference<>() {});
        } catch (IOException e) {
            throw new IllegalStateException("Falha ao carregar fixture fixtures/eventos.json", e);
        }
    }

    @Override
    public List<EventoInesperadoDTO> obterDados() {
        return cacheEventos;
    }
}