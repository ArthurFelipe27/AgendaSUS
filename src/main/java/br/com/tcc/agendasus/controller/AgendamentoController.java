package br.com.tcc.agendasus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.tcc.agendasus.dto.DTOs.AgendamentoCadastroDTO;
import br.com.tcc.agendasus.dto.DTOs.AgendamentoResponseDTO;
import br.com.tcc.agendasus.dto.DTOs.AgendamentoStatusUpdateDTO;
import br.com.tcc.agendasus.dto.DTOs.FinalizarConsultaDTO;
import br.com.tcc.agendasus.dto.DTOs.ProntuarioDTO;
import br.com.tcc.agendasus.service.AgendamentoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {

    private final AgendamentoService service;

    public AgendamentoController(AgendamentoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<AgendamentoResponseDTO> criar(@RequestBody @Valid AgendamentoCadastroDTO dados, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criarAgendamento(dados, auth));
    }

    @GetMapping("/meus")
    public ResponseEntity<List<AgendamentoResponseDTO>> listarMeus(Authentication auth) {
        return ResponseEntity.ok(service.listarMeusAgendamentos(auth));
    }

    @GetMapping("/todos")
    public ResponseEntity<List<AgendamentoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(service.listarTodosAgendamentos());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AgendamentoResponseDTO> atualizarStatus(@PathVariable Long id, @RequestBody @Valid AgendamentoStatusUpdateDTO dados, Authentication auth) {
        return ResponseEntity.ok(service.atualizarStatus(id, dados, auth));
    }
    
    /**
     * CORREÇÃO: Este método estava faltando. 
     * Ele cria o endpoint PUT /api/agendamentos/{id}/cancelar, que é chamado pelo
     * botão "Cancelar" na tela do paciente.
     */
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<AgendamentoResponseDTO> cancelarAgendamento(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(service.cancelarAgendamentoPaciente(id, auth));
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<Void> finalizarConsulta(@PathVariable Long id, @RequestBody @Valid FinalizarConsultaDTO dados, Authentication auth) {
        service.finalizarConsulta(id, dados, auth);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}/prontuario")
    public ResponseEntity<ProntuarioDTO> getProntuario(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(service.getProntuarioDoAgendamento(id, auth));
    }
}

