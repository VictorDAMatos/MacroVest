package br.edu.vault.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient dadosRestClient(@Value("${vault.servicos.dados-url}") String dadosUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(2));
        factory.setReadTimeout(Duration.ofSeconds(2));

        return RestClient.builder()
                .baseUrl(dadosUrl)
                .requestFactory(factory)
                .build();
    }

    @Bean
    public RestClient simuladorRestClient(@Value("${vault.servicos.simulador-url}") String simuladorUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(3));
        factory.setReadTimeout(Duration.ofSeconds(5));

        return RestClient.builder()
                .baseUrl(simuladorUrl)
                .requestFactory(factory)
                .build();
    }
}