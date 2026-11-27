package br.edu.vault.api.servico;

import br.edu.vault.api.clientes.ClienteSimulador;
import br.edu.vault.api.clientes.FonteEventosHttp;
import br.edu.vault.api.clientes.FonteInflacaoHttp;
import br.edu.vault.api.dominio.PerfilEntity;
import br.edu.vault.api.dominio.SimulacaoEntity;
import br.edu.vault.api.dto.*;
import br.edu.vault.api.repositorio.PerfilRepository;
import br.edu.vault.api.repositorio.SimulacaoRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrquestradorSimulacaoService {

    private final PerfilRepository perfilRepository;
    private final SimulacaoRepository simulacaoRepository;
    private final PerfilService perfilService;
    private final FonteInflacaoHttp fonteInflacaoHttp;
    private final FonteEventosHttp fonteEventosHttp;
    private final ClienteSimulador clienteSimulador;
    private final ObjectMapper objectMapper;

    public SimulacaoResponseDTO buscarPorId(Long simulacaoId) {
        SimulacaoEntity entity = simulacaoRepository.findById(simulacaoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Simulação não encontrada com ID: " + simulacaoId));

        return converterParaDTO(entity);
    }

    public SimulacaoResponseDTO converterParaDTO(SimulacaoEntity entity) {
        try {
            List<ResultadoMensalDTO> evolucao = objectMapper.readValue(
                    entity.getEvolucaoMensalJson(),
                    new com.fasterxml.jackson.core.type.TypeReference<>() {}
            );

            return new SimulacaoResponseDTO(
                    entity.getId(),
                    entity.getPerfil().getId(),
                    entity.getPoliticaAplicada(),
                    entity.getMesesSobrevivencia(),
                    entity.getDiasAdicionais(),
                    entity.isHouveTimeoutDados(),
                    entity.getTempoProcessamentoMs(),
                    evolucao
            );
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Erro ao desserializar evolução mensal da simulação ID: " + entity.getId(), e);
        }
    }

    public SimulacaoResponseDTO executarSimulacao(
            Long perfilId,
            String tipoPolitica,
            boolean incluirEventos,
            String idempotencyKey
    ) {
        long inicioTotalNs = System.nanoTime();

        // 1. Busca o perfil financeiro no MySQL
        PerfilEntity perfilEntity = perfilRepository.findById(perfilId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Perfil não encontrado: " + perfilId));
        PerfilDTO perfilDTO = perfilService.converterParaDTO(perfilEntity);

        // 2. Dispara chamadas paralelas ao vault-dados com CompletableFuture + Timeout
        CompletableFuture<InflacaoDTO> futureInflacao = CompletableFuture
                .supplyAsync(fonteInflacaoHttp::obterDados)
                .orTimeout(2500, TimeUnit.MILLISECONDS)
                .exceptionally(ex -> {
                    log.warn("[FALLBACK] Falha/Timeout ao buscar inflação no vault-dados: {}", ex.getMessage());
                    return new InflacaoDTO("FALLBACK_PADRAO", 0.0040, List.of(), true);
                });

        CompletableFuture<List<EventoInesperadoDTO>> futureEventos = incluirEventos
                ? CompletableFuture.supplyAsync(fonteEventosHttp::obterDados)
                .orTimeout(2500, TimeUnit.MILLISECONDS)
                .exceptionally(ex -> {
                    log.warn("[FALLBACK] Falha/Timeout ao buscar eventos no vault-dados: {}", ex.getMessage());
                    return List.of();
                })
                : CompletableFuture.completedFuture(List.of());

        // Aguarda ambas as tarefas assíncronas concluírem simultaneamente
        CompletableFuture.allOf(futureInflacao, futureEventos).join();

        InflacaoDTO inflacao = futureInflacao.join();
        List<EventoInesperadoDTO> eventos = futureEventos.join();

        // 3. Envia os dados consolidados para o motor matemático (vault-simulador)
        CalculoRequestDTO calculoRequest = new CalculoRequestDTO(
                perfilDTO,
                tipoPolitica,
                inflacao,
                eventos
        );

        SimulacaoResponseDTO respostaMotor = clienteSimulador.calcular(calculoRequest);

        long tempoTotalMs = (System.nanoTime() - inicioTotalNs) / 1_000_000L;

        // 4. Persiste a simulação no MySQL
        SimulacaoEntity simulacaoSalva = salvarSimulacao(
                perfilEntity,
                respostaMotor,
                idempotencyKey,
                tempoTotalMs
        );

        return new SimulacaoResponseDTO(
                simulacaoSalva.getId(),
                perfilEntity.getId(),
                respostaMotor.politicaAplicada(),
                respostaMotor.mesesSobrevivencia(),
                respostaMotor.diasAdicionais(),
                respostaMotor.houveTimeoutDados(),
                tempoTotalMs,
                respostaMotor.evolucaoMensal()
        );
    }

    private SimulacaoEntity salvarSimulacao(
            PerfilEntity perfil,
            SimulacaoResponseDTO resposta,
            String idempotencyKey,
            long tempoTotalMs
    ) {
        try {
            String evolucaoJson = objectMapper.writeValueAsString(resposta.evolucaoMensal());

            SimulacaoEntity entity = SimulacaoEntity.builder()
                    .idempotencyKey(idempotencyKey)
                    .perfil(perfil)
                    .politicaAplicada(resposta.politicaAplicada())
                    .mesesSobrevivencia(resposta.mesesSobrevivencia())
                    .diasAdicionais(resposta.diasAdicionais())
                    .houveTimeoutDados(resposta.houveTimeoutDados())
                    .tempoProcessamentoMs(tempoTotalMs)
                    .evolucaoMensalJson(evolucaoJson)
                    .build();

            return simulacaoRepository.save(entity);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Erro ao serializar evolução mensal da simulação", e);
        }

    }
}