package br.com.tcc.agendasus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.tcc.agendasus.dto.AtestadoCadastroDTO;
import br.com.tcc.agendasus.dto.AtestadoResponseDTO;
import br.com.tcc.agendasus.service.AtestadoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/atestados")
public class AtestadoController {

    private final AtestadoService service;

    public AtestadoController(AtestadoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<AtestadoResponseDTO> criar(@RequestBody @Valid AtestadoCadastroDTO dados, Authentication auth) {
        AtestadoResponseDTO response = service.criar(dados, auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/meus")
    public ResponseEntity<List<AtestadoResponseDTO>> listarMinhas(Authentication auth) {
        return ResponseEntity.ok(service.listarMinhas(auth));
    }

    @GetMapping("/todas")
    public ResponseEntity<List<AtestadoResponseDTO>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }
}