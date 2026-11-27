package br.edu.vault.api.dominio;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dividas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DividaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false)
    private double valorParcela;

    @Column(nullable = false)
    private int parcelasRestantes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "perfil_id", nullable = false)
    private PerfilEntity perfil;
}