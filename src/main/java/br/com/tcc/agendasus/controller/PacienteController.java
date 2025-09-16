package br.com.tcc.agendasus.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.tcc.agendasus.dto.ProntuarioDTO;
import br.com.tcc.agendasus.service.PacienteService;

@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {

    private final PacienteService service;

    public PacienteController(PacienteService service) {
        this.service = service;
    }

    @GetMapping("/{id}/prontuario")
    public ResponseEntity<ProntuarioDTO> getProntuario(@PathVariable Long id, Authentication authentication) {
        ProntuarioDTO prontuario = service.getProntuario(id, authentication);
        return ResponseEntity.ok(prontuario);
    }
}