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

import br.com.tcc.agendasus.dto.ExameCadastroDTO;
import br.com.tcc.agendasus.dto.ExameResponseDTO;
import br.com.tcc.agendasus.dto.ExameResultadoUpdateDTO;
import br.com.tcc.agendasus.service.ExameService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/exames")
public class ExameController {

    private final ExameService service;

    public ExameController(ExameService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ExameResponseDTO> criar(@RequestBody @Valid ExameCadastroDTO dados, Authentication auth) {
        ExameResponseDTO response = service.criar(dados, auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/meus")
    public ResponseEntity<List<ExameResponseDTO>> listarMinhas(Authentication auth) {
        return ResponseEntity.ok(service.listarMinhas(auth));
    }

    @GetMapping("/todas")
    public ResponseEntity<List<ExameResponseDTO>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @PutMapping("/{id}/resultado")
public ResponseEntity<ExameResponseDTO> atualizarResultado(
        @PathVariable Long id,
        @RequestBody @Valid ExameResultadoUpdateDTO dados,
        Authentication auth) {
            
    ExameResponseDTO exameAtualizado = service.atualizarResultado(id, dados, auth);
    return ResponseEntity.ok(exameAtualizado);
}
}