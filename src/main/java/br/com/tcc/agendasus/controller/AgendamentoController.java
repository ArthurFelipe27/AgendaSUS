package br.com.tcc.agendasus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication; // <-- IMPORT NOVO
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.tcc.agendasus.dto.AgendamentoCadastroDTO;
import br.com.tcc.agendasus.dto.AgendamentoResponseDTO;
import br.com.tcc.agendasus.dto.AgendamentoStatusUpdateDTO;
import br.com.tcc.agendasus.dto.ProntuarioDTO;
import br.com.tcc.agendasus.service.AgendamentoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    public AgendamentoController(AgendamentoService agendamentoService) {
        this.agendamentoService = agendamentoService;
    }

    @PostMapping
    public ResponseEntity<AgendamentoResponseDTO> criarAgendamento(@RequestBody @Valid AgendamentoCadastroDTO dados, Authentication authentication) {
        AgendamentoResponseDTO agendamentoCriado = agendamentoService.criarAgendamento(dados, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(agendamentoCriado);
    }

    @GetMapping("/meus")
    public ResponseEntity<List<AgendamentoResponseDTO>> listarMeusAgendamentos(Authentication authentication) {
        List<AgendamentoResponseDTO> lista = agendamentoService.listarMeusAgendamentos(authentication);
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/todos")
    public ResponseEntity<List<AgendamentoResponseDTO>> listarTodosAgendamentos() {
        List<AgendamentoResponseDTO> lista = agendamentoService.listarTodosAgendamentos();
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AgendamentoResponseDTO> atualizarStatus(
            @PathVariable Long id,
            @RequestBody @Valid AgendamentoStatusUpdateDTO dados,
            Authentication authentication) {
            
        AgendamentoResponseDTO agendamentoAtualizado = agendamentoService.atualizarStatus(id, dados, authentication);
        return ResponseEntity.ok(agendamentoAtualizado);
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<AgendamentoResponseDTO> cancelarAgendamentoPaciente(
            @PathVariable Long id,
            Authentication authentication) {
        
        AgendamentoResponseDTO agendamentoCancelado = agendamentoService.cancelarAgendamentoPaciente(id, authentication);
        return ResponseEntity.ok(agendamentoCancelado);
    }
    
    // --- O MÉTODO QUE ESTAVA FALTANDO ---
    @GetMapping("/{id}/prontuario")
    public ResponseEntity<ProntuarioDTO> getProntuarioDoAgendamento(@PathVariable Long id, Authentication authentication) {
        ProntuarioDTO prontuario = agendamentoService.getProntuarioDoAgendamento(id, authentication);
        return ResponseEntity.ok(prontuario);
    }
}