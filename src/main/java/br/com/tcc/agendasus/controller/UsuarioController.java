package br.com.tcc.agendasus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.tcc.agendasus.dto.DTOs.UsuarioCadastroDTO;
import br.com.tcc.agendasus.dto.DTOs.UsuarioResponseDTO;
import br.com.tcc.agendasus.dto.DTOs.UsuarioUpdateDTO;
import br.com.tcc.agendasus.service.AuthorizationService;
import br.com.tcc.agendasus.service.UsuarioService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AuthorizationService authorizationService;

    public UsuarioController(UsuarioService usuarioService, AuthorizationService authorizationService) {
        this.usuarioService = usuarioService;
        this.authorizationService = authorizationService;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> cadastrar(@RequestBody @Valid UsuarioCadastroDTO dados) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.cadastrarUsuario(dados));
    }

    @GetMapping
    @PreAuthorize("hasRole('DIRETOR')") // Garante que só diretores podem listar
    public ResponseEntity<List<UsuarioResponseDTO>> listar() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> getMeuPerfil(Authentication auth) {
        return ResponseEntity.ok(new UsuarioResponseDTO(authorizationService.getUsuarioLogado(auth)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizar(@PathVariable Long id, @RequestBody @Valid UsuarioUpdateDTO dados, Authentication auth) {
        authorizationService.verificarSePodeAlterarRecurso(auth, id);
        return ResponseEntity.ok(usuarioService.atualizarUsuario(id, dados));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DIRETOR')") // Garante que só diretores podem desativar
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        usuarioService.desativarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    // NOVO ENDPOINT: reativar
    @PutMapping("/{id}/reativar")
    @PreAuthorize("hasRole('DIRETOR')") // Garante que só diretores podem reativar
    public ResponseEntity<Void> reativar(@PathVariable Long id) {
        usuarioService.reativarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}
