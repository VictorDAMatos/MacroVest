package br.edu.vault.simulador.politicas;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class PoliticaConsumoFactory {

    private final Map<String, PoliticaConsumo> estrategias = Map.of(
            "PADRAO", new PoliticaPadrao(),
            "ECONOMICA", new PoliticaEconomica(),
            "EMERGENCIA", new PoliticaEmergencia()
    );

    public PoliticaConsumo obter(String tipoPolitica) {
        if (tipoPolitica == null || tipoPolitica.isBlank()) {
            return estrategias.get("PADRAO");
        }
        PoliticaConsumo politica = estrategias.get(tipoPolitica.trim().toUpperCase());
        if (politica == null) {
            throw new IllegalArgumentException("Política de consumo inválida: " + tipoPolitica +
                    ". Valores aceitos: PADRAO, ECONOMICA, EMERGENCIA.");
        }
        return politica;
    }
}