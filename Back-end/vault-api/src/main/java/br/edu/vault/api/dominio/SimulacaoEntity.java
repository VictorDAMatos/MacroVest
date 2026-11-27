package br.edu.vault.api.dominio;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "simulacoes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulacaoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "idempotency_key", unique = true)
    private String idempotencyKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "perfil_id", nullable = false)
    private PerfilEntity perfil;

    @Column(nullable = false)
    private String politicaAplicada;

    @Column(nullable = false)
    private int mesesSobrevivencia;

    @Column(nullable = false)
    private int diasAdicionais;

    @Column(nullable = false)
    private boolean houveTimeoutDados;

    @Column(nullable = false)
    private long tempoProcessamentoMs;

    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String evolucaoMensalJson;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    public void prePersist() {
        this.criadoEm = LocalDateTime.now();
    }
}