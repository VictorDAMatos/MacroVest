package br.edu.vault.api.dto;

public record SimulacaoRequestDTO(
        String tipoPolitica,              // "PADRAO", "ECONOMICA" ou "EMERGENCIA"
        Boolean incluirEventosInesperados // Se null, assume true por padrão
) {}