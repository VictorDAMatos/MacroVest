package br.edu.vault.api.repositorio;

import br.edu.vault.api.dominio.SimulacaoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SimulacaoRepository extends JpaRepository<SimulacaoEntity, Long> {
    Optional<SimulacaoEntity> findByIdempotencyKey(String idempotencyKey);
}