package br.com.tcc.agendasus.controller;

import br.com.tcc.agendasus.dto.DTOs.*;
import br.com.tcc.agendasus.service.AtestadoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/atestados")
public class AtestadoController {

    private final AtestadoService service;

    public AtestadoController(AtestadoService service) {
        this.service = service;
    }

    // Este endpoint pode ser removido se o atestado for sempre criado ao finalizar a consulta
    // @PostMapping
    // public ResponseEntity<AtestadoResponseDTO> criar(@RequestBody @Valid AtestadoCadastroDTO dados, Authentication auth) {
    //     return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dados, auth));
    // }

    @GetMapping("/meus")
    public ResponseEntity<List<AtestadoResponseDTO>> listarMinhas(Authentication auth) {
        return ResponseEntity.ok(service.listarMinhas(auth));
    }

    @GetMapping("/agendamento/{id}")
    public ResponseEntity<AtestadoResponseDTO> buscarPorAgendamento(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(service.buscarPorAgendamento(id, auth));
    }
}
