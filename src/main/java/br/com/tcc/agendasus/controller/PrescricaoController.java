package br.com.tcc.agendasus.controller;

import br.com.tcc.agendasus.dto.DTOs.*;
import br.com.tcc.agendasus.service.PrescricaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescricoes")
public class PrescricaoController {

    private final PrescricaoService service;

    public PrescricaoController(PrescricaoService service) {
        this.service = service;
    }

    @GetMapping("/meus")
    public ResponseEntity<List<PrescricaoResponseDTO>> listarMinhas(Authentication auth) {
        return ResponseEntity.ok(service.listarMinhas(auth));
    }

    @GetMapping("/agendamento/{id}")
    public ResponseEntity<PrescricaoResponseDTO> buscarPorAgendamento(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(service.buscarPorAgendamento(id, auth));
    }
}
