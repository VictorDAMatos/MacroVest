package br.edu.vault.api.servico;

import br.edu.vault.api.dominio.DividaEntity;
import br.edu.vault.api.dominio.PerfilEntity;
import br.edu.vault.api.dto.DividaDTO;
import br.edu.vault.api.dto.PerfilDTO;
import br.edu.vault.api.repositorio.PerfilRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PerfilService {

    private final PerfilRepository perfilRepository;

    @Transactional
    public PerfilDTO criarPerfil(PerfilDTO dto) {
        if (dto.nome() == null || dto.nome().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O nome do perfil é obrigatório.");
        }
        if (dto.reservaTotal() < 0 || dto.despesasFixas() < 0 || dto.despesasVariaveis() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valores financeiros não podem ser negativos.");
        }

        PerfilEntity entity = PerfilEntity.builder()
                .nome(dto.nome())
                .rendaMensal(dto.rendaMensal())
                .reservaTotal(dto.reservaTotal())
                .despesasFixas(dto.despesasFixas())
                .despesasVariaveis(dto.despesasVariaveis())
                .build();

        if (dto.dividas() != null) {
            dto.dividas().forEach(d -> {
                DividaEntity divida = DividaEntity.builder()
                        .descricao(d.descricao())
                        .valorParcela(d.valorParcela())
                        .parcelasRestantes(d.parcelasRestantes())
                        .build();
                entity.adicionarDivida(divida);
            });
        }

        PerfilEntity salvo = perfilRepository.save(entity);
        return converterParaDTO(salvo);
    }

    @Transactional(readOnly = true)
    public PerfilDTO buscarPorId(Long id) {
        PerfilEntity entity = perfilRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Perfil não encontrado com ID: " + id));
        return converterParaDTO(entity);
    }

    public PerfilDTO converterParaDTO(PerfilEntity entity) {
        List<DividaDTO> dividasDTO = entity.getDividas().stream()
                .map(d -> new DividaDTO(d.getDescricao(), d.getValorParcela(), d.getParcelasRestantes()))
                .toList();

        return new PerfilDTO(
                entity.getId(),
                entity.getNome(),
                entity.getRendaMensal(),
                entity.getReservaTotal(),
                entity.getDespesasFixas(),
                entity.getDespesasVariaveis(),
                dividasDTO
        );
    }
}