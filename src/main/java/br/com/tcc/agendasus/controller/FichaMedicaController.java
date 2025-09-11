package br.com.tcc.agendasus.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.tcc.agendasus.dto.FichaMedicaResponseDTO;
import br.com.tcc.agendasus.service.FichaMedicaService;

@RestController
@RequestMapping("/api/fichas-medicas")
public class FichaMedicaController {

    private final FichaMedicaService service;

    public FichaMedicaController(FichaMedicaService service) {
        this.service = service;
    }

    @GetMapping("/agendamento/{agendamentoId}")
    public ResponseEntity<FichaMedicaResponseDTO> getFichaPorAgendamentoId(@PathVariable Long agendamentoId, Authentication authentication) {
        FichaMedicaResponseDTO fichaDTO = service.getFichaPorAgendamentoId(agendamentoId, authentication);
        return ResponseEntity.ok(fichaDTO);
    }
}