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

import br.com.tcc.agendasus.dto.DTOs.*;
import br.com.tcc.agendasus.dto.DTOs.HorarioDisponivelDTO;
import br.com.tcc.agendasus.dto.DTOs.MedicoCadastroDTO;
import br.com.tcc.agendasus.dto.DTOs.MedicoResponseDTO;
import br.com.tcc.agendasus.dto.DTOs.MedicoUpdateDTO;
import br.com.tcc.agendasus.service.AuthorizationService;
import br.com.tcc.agendasus.service.MedicoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/medicos")
public class MedicoController {

    private final MedicoService medicoService;
    private final AuthorizationService authorizationService;

    public MedicoController(MedicoService medicoService, AuthorizationService authorizationService) {
        this.medicoService = medicoService;
        this.authorizationService = authorizationService;
    }

    @PostMapping
    public ResponseEntity<MedicoResponseDTO> cadastrar(@RequestBody @Valid MedicoCadastroDTO dados) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicoService.cadastrarMedico(dados));
    }

    @GetMapping
    public ResponseEntity<List<MedicoResponseDTO>> listar() {
        return ResponseEntity.ok(medicoService.listarTodos());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<MedicoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(medicoService.getMedicoPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicoResponseDTO> atualizar(@PathVariable Long id, @RequestBody MedicoUpdateDTO dados) {
        return ResponseEntity.ok(medicoService.atualizarMedico(id, dados));
    }
    
    @PutMapping("/horarios")
    public ResponseEntity<Void> atualizarHorarios(@RequestBody @Valid HorarioDisponivelDTO horarios, Authentication auth) {
        Long medicoId = authorizationService.getUsuarioLogado(auth).getId();
        medicoService.atualizarHorarios(medicoId, horarios);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/horarios")
    public ResponseEntity<HorarioDisponivelDTO> listarHorarios(@PathVariable Long id) {
        return ResponseEntity.ok(medicoService.getHorariosDoMedico(id));
    }
}
