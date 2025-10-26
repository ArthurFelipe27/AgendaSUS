package br.com.tcc.agendasus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize; // Import for authorization

import br.com.tcc.agendasus.dto.DTOs.*;
import br.com.tcc.agendasus.service.AuthorizationService;
import br.com.tcc.agendasus.service.UsuarioService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AuthorizationService authorizationService; // Keep authorization service if needed elsewhere

    public UsuarioController(UsuarioService usuarioService, AuthorizationService authorizationService) {
        this.usuarioService = usuarioService;
        this.authorizationService = authorizationService;
    }

    // Cadastro público de PACIENTE
    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> cadastrar(@RequestBody @Valid UsuarioCadastroDTO dados) {
        // A lógica no service já garante que o role será PACIENTE
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.cadastrarUsuario(dados));
    }

    // Listar todos (SOMENTE DIRETOR)
    @GetMapping
    @PreAuthorize("hasRole('DIRETOR')") // Garante que só o diretor pode listar todos
    public ResponseEntity<List<UsuarioResponseDTO>> listar() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    // Obter perfil do usuário logado (QUALQUER AUTENTICADO)
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> getMeuPerfil(Authentication auth) {
        // Chama o novo método que busca dados do paciente se aplicável
        return ResponseEntity.ok(usuarioService.getMeuPerfilCompleto(auth));
    }

    // Atualizar nome ou senha (próprio usuário OU DIRETOR)
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizar(@PathVariable Long id, @RequestBody @Valid UsuarioUpdateDTO dados, Authentication auth) {
        // A validação de permissão está dentro do service agora
        return ResponseEntity.ok(usuarioService.atualizarUsuario(id, dados, auth));
    }

    // [NOVO] Atualizar dados específicos do Paciente (SOMENTE o próprio paciente)
    @PutMapping("/me/paciente")
    @PreAuthorize("hasRole('PACIENTE')") // Garante que só pacientes podem chamar este endpoint
    public ResponseEntity<UsuarioResponseDTO> atualizarMeuPerfilPaciente(@RequestBody @Valid PacienteUpdateDTO dadosPaciente, Authentication auth) {
        Long idUsuarioLogado = authorizationService.getUsuarioLogado(auth).getId();
        return ResponseEntity.ok(usuarioService.atualizarDadosPaciente(idUsuarioLogado, dadosPaciente, auth));
    }


    // Desativar usuário (SOMENTE DIRETOR)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DIRETOR')") // Garante que só o diretor pode desativar
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        // Adicionar validação para não desativar a si mesmo? (Pode ser no service)
        usuarioService.desativarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    // [NOVO] Reativar usuário (SOMENTE DIRETOR)
    @PutMapping("/{id}/reativar")
    @PreAuthorize("hasRole('DIRETOR')") // Garante que só o diretor pode reativar
    public ResponseEntity<Void> reativar(@PathVariable Long id) {
        usuarioService.reativarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}

