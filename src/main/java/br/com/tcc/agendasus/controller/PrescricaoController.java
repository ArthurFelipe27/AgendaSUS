package br.com.tcc.agendasus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.tcc.agendasus.dto.PrescricaoCadastroDTO;
import br.com.tcc.agendasus.dto.PrescricaoResponseDTO;
import br.com.tcc.agendasus.service.PrescricaoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/prescricoes")
public class PrescricaoController {

    private final PrescricaoService service;

    public PrescricaoController(PrescricaoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<PrescricaoResponseDTO> criar(@RequestBody @Valid PrescricaoCadastroDTO dados, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dados, auth));
    }

    @GetMapping("/meus")
    public ResponseEntity<List<PrescricaoResponseDTO>> listarMinhas(Authentication auth) {
        return ResponseEntity.ok(service.listarMinhas(auth));
    }

    @GetMapping("/todas")
    public ResponseEntity<List<PrescricaoResponseDTO>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/agendamento/{id}")
    public ResponseEntity<PrescricaoResponseDTO> buscarPorAgendamento(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(service.buscarPorAgendamento(id, auth));
    }
}