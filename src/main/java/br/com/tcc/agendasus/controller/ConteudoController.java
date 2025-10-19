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

import br.com.tcc.agendasus.dto.DTOs.*;
import br.com.tcc.agendasus.dto.DTOs.ConteudoCadastroDTO;
import br.com.tcc.agendasus.dto.DTOs.ConteudoResponseDTO;
import br.com.tcc.agendasus.dto.DTOs.ConteudoUpdateDTO;
import br.com.tcc.agendasus.service.ConteudoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/conteudo")
public class ConteudoController {

    private final ConteudoService service;

    public ConteudoController(ConteudoService service) {
        this.service = service;
    }

    @GetMapping("/publico")
    public ResponseEntity<List<ConteudoResponseDTO>> listarPublicados() {
        return ResponseEntity.ok(service.listarPublicados());
    }
    
    // [NOVO] Endpoint para o médico listar seus próprios conteúdos
    @GetMapping("/meus")
    public ResponseEntity<List<ConteudoResponseDTO>> listarMeus(Authentication auth) {
        return ResponseEntity.ok(service.listarMeusConteudos(auth));
    }

    // [NOVO] Endpoint para buscar um conteúdo específico (para edição)
    @GetMapping("/admin/{id}")
    public ResponseEntity<ConteudoResponseDTO> buscarPorIdAdmin(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(service.buscarPorIdAdmin(id, auth));
    }

    @PostMapping("/admin")
    public ResponseEntity<ConteudoResponseDTO> criar(@RequestBody @Valid ConteudoCadastroDTO dados, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dados, auth));
    }

    @GetMapping("/admin/todos")
    public ResponseEntity<List<ConteudoResponseDTO>> listarTodosAdmin() {
        return ResponseEntity.ok(service.listarTodosAdmin());
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<ConteudoResponseDTO> atualizar(@PathVariable Long id, @RequestBody ConteudoUpdateDTO dados, Authentication auth) {
        return ResponseEntity.ok(service.atualizar(id, dados, auth));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, Authentication auth) {
        service.deletar(id, auth);
        return ResponseEntity.noContent().build();
    }
}
