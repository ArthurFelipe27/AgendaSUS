package br.com.tcc.agendasus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.tcc.agendasus.dto.DTOs.UnidadeSaudeCadastroDTO;
import br.com.tcc.agendasus.dto.DTOs.UnidadeSaudeResponseDTO;
import br.com.tcc.agendasus.service.UnidadeDeSaudeService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/unidades-saude")
public class UnidadeDeSaudeController {

    private final UnidadeDeSaudeService service;

    public UnidadeDeSaudeController(UnidadeDeSaudeService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<UnidadeSaudeResponseDTO> criar(@RequestBody @Valid UnidadeSaudeCadastroDTO dados) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dados));
    }

    @GetMapping
    public ResponseEntity<List<UnidadeSaudeResponseDTO>> listar() {
        return ResponseEntity.ok(service.listarTodas());
    }
}
