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

import br.com.tcc.agendasus.dto.AgendamentoCadastroDTO;
import br.com.tcc.agendasus.dto.AgendamentoResponseDTO;
import br.com.tcc.agendasus.dto.AgendamentoStatusUpdateDTO;
import br.com.tcc.agendasus.dto.FinalizarConsultaDTO;
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
        return ResponseEntity.ok(agendamentoService.listarMeusAgendamentos(authentication));
    }

    @GetMapping("/todos")
    public ResponseEntity<List<AgendamentoResponseDTO>> listarTodosAgendamentos() {
        return ResponseEntity.ok(agendamentoService.listarTodosAgendamentos());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AgendamentoResponseDTO> atualizarStatus(@PathVariable Long id, @RequestBody @Valid AgendamentoStatusUpdateDTO dados, Authentication authentication) {
        return ResponseEntity.ok(agendamentoService.atualizarStatus(id, dados, authentication));
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<AgendamentoResponseDTO> cancelarAgendamentoPaciente(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(agendamentoService.cancelarAgendamentoPaciente(id, authentication));
    }
    
    @GetMapping("/{id}/prontuario")
    public ResponseEntity<ProntuarioDTO> getProntuarioDoAgendamento(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(agendamentoService.getProntuarioDoAgendamento(id, authentication));
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<Void> finalizarConsulta(@PathVariable Long id, @RequestBody @Valid FinalizarConsultaDTO dados, Authentication authentication) {
        agendamentoService.finalizarConsulta(id, dados, authentication);
        return ResponseEntity.ok().build();
    }
}