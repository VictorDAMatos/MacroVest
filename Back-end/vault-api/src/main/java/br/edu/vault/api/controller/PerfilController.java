package br.edu.vault.api.controller;

import br.edu.vault.api.dto.PerfilDTO;
import br.edu.vault.api.servico.PerfilService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/perfis")
@RequiredArgsConstructor
public class PerfilController {

    private final PerfilService perfilService;

    @PostMapping
    public ResponseEntity<PerfilDTO> cadastrar(@RequestBody PerfilDTO dto) {
        PerfilDTO criado = perfilService.criarPerfil(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PerfilDTO> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(perfilService.buscarPorId(id));
    }
}