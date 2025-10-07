package br.com.tcc.agendasus.controller;

import br.com.tcc.agendasus.dto.DTOs.*;
import br.com.tcc.agendasus.service.ExameService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exames")
public class ExameController {

    private final ExameService service;

    public ExameController(ExameService service) {
        this.service = service;
    }

    @GetMapping("/meus")
    public ResponseEntity<List<ExameResponseDTO>> listarMinhas(Authentication auth) {
        return ResponseEntity.ok(service.listarMinhas(auth));
    }

    @PutMapping("/{id}/resultado")
    public ResponseEntity<ExameResponseDTO> atualizarResultado(@PathVariable Long id, @RequestBody @Valid ExameResultadoUpdateDTO dados, Authentication auth) {
        return ResponseEntity.ok(service.atualizarResultado(id, dados, auth));
    }

    @GetMapping("/agendamento/{id}")
    public ResponseEntity<List<ExameResponseDTO>> buscarPorAgendamento(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(service.buscarPorAgendamento(id, auth));
    }
}
