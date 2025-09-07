package br.com.tcc.agendasus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.tcc.agendasus.dto.HorarioDisponivelDTO;
import br.com.tcc.agendasus.dto.MedicoCadastroDTO;
import br.com.tcc.agendasus.dto.MedicoResponseDTO;
import br.com.tcc.agendasus.dto.MedicoUpdateDTO;
import br.com.tcc.agendasus.service.MedicoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/medicos")
public class MedicoController {

    private final MedicoService medicoService;

    public MedicoController(MedicoService medicoService) {
        this.medicoService = medicoService;
    }

    @PostMapping
    public ResponseEntity<MedicoResponseDTO> cadastrarMedico(@RequestBody @Valid MedicoCadastroDTO dados) {
        MedicoResponseDTO novoMedico = medicoService.cadastrarMedico(dados);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoMedico);
    }

    @GetMapping
    public ResponseEntity<List<MedicoResponseDTO>> listarMedicos() {
        List<MedicoResponseDTO> medicos = medicoService.listarTodos();
        return ResponseEntity.ok(medicos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<MedicoResponseDTO> getMedicoPorId(@PathVariable Long id) {
        MedicoResponseDTO medico = medicoService.getMedicoPorId(id);
        return ResponseEntity.ok(medico);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicoResponseDTO> atualizarMedico(@PathVariable Long id, @RequestBody MedicoUpdateDTO dados) {
        MedicoResponseDTO medicoAtualizado = medicoService.atualizarMedico(id, dados);
        return ResponseEntity.ok(medicoAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativarMedico(@PathVariable Long id) {
        medicoService.desativarMedico(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/horarios")
    public ResponseEntity<Void> atualizarHorarios(@RequestBody @Valid HorarioDisponivelDTO horarios) {
        medicoService.atualizarHorarios(horarios);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/horarios")
    public ResponseEntity<HorarioDisponivelDTO> listarHorariosDoMedico(@PathVariable Long id) {
        HorarioDisponivelDTO horarios = medicoService.getHorariosDoMedico(id);
        return ResponseEntity.ok(horarios);
    }
}