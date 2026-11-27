package br.edu.vault.api.repositorio;

import br.edu.vault.api.dominio.PerfilEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PerfilRepository extends JpaRepository<PerfilEntity, Long> {
}