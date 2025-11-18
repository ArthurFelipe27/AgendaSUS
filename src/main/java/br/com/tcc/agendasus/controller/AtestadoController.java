package br.com.tcc.agendasus.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.tcc.agendasus.dto.DTOs.*;
import br.com.tcc.agendasus.dto.DTOs.AtestadoResponseDTO;
import br.com.tcc.agendasus.service.AtestadoService;

@RestController
@RequestMapping("/api/atestados")
public class AtestadoController {

    private final AtestadoService service;

    public AtestadoController(AtestadoService service) {
        this.service = service;
    }

    @GetMapping("/meus")
    public ResponseEntity<List<AtestadoResponseDTO>> listarMinhas(Authentication auth) {
        return ResponseEntity.ok(service.listarMinhas(auth));
    }

    @GetMapping("/agendamento/{id}")
    public ResponseEntity<AtestadoResponseDTO> buscarPorAgendamento(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(service.buscarPorAgendamento(id, auth));
    }
}
