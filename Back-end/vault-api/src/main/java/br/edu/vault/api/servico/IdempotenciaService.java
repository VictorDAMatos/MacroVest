package br.edu.vault.api.servico;

import br.edu.vault.api.dominio.SimulacaoEntity;
import br.edu.vault.api.dto.SimulacaoResponseDTO;
import br.edu.vault.api.repositorio.SimulacaoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class IdempotenciaService {

    private final SimulacaoRepository simulacaoRepository;
    private final OrquestradorSimulacaoService orquestradorService;

    public Optional<SimulacaoResponseDTO> buscarSimulacaoExistente(String idempotencyKey, Long perfilId) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return Optional.empty();
        }

        return simulacaoRepository.findByIdempotencyKey(idempotencyKey.trim())
                .map(entity -> {
                    if (!entity.getPerfil().getId().equals(perfilId)) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "A chave de idempotência informada já foi utilizada em outro perfil."
                        );
                    }
                    log.info("[IDEMPOTENCIA] Cache hit para chave '{}' -> Retornando simulação ID {}",
                            idempotencyKey, entity.getId());
                    return orquestradorService.converterParaDTO(entity);
                });
    }
}