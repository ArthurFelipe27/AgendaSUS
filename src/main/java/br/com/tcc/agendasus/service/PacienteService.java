package br.com.tcc.agendasus.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.tcc.agendasus.dto.ProntuarioDTO;
import br.com.tcc.agendasus.model.entity.Agendamento;
import br.com.tcc.agendasus.model.entity.Paciente;
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.StatusAgendamento;
import br.com.tcc.agendasus.repository.AgendamentoRepository;
import br.com.tcc.agendasus.repository.ExameRepository;
import br.com.tcc.agendasus.repository.PacienteRepository;

@Service
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final ExameRepository exameRepository;

    public PacienteService(PacienteRepository pacienteRepository, AgendamentoRepository agendamentoRepository, ExameRepository exameRepository) {
        this.pacienteRepository = pacienteRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.exameRepository = exameRepository;
    }

   // Em: br/com/tcc/agendasus/service/PacienteService.java

@Transactional(readOnly = true)
public ProntuarioDTO getProntuario(Long pacienteId, Authentication authentication) {
    Usuario medicoLogado = (Usuario) authentication.getPrincipal();
    Long medicoId = medicoLogado.getId();

    Paciente paciente = pacienteRepository.findById(pacienteId)
            .orElseThrow(() -> new RuntimeException("Paciente não encontrado."));

    // --- Cálculos que já tínhamos ---
    int idade = Period.between(paciente.getDataNascimento(), LocalDate.now()).getYears();
    long totalConsultas = agendamentoRepository.countByPacienteIdUsuarioAndMedicoIdUsuarioAndStatus(pacienteId, medicoId, StatusAgendamento.ATENDIDO);
    boolean temExames = exameRepository.existsByPacienteIdUsuario(pacienteId);
    LocalDateTime proximaConsulta = agendamentoRepository
        .findFirstByPacienteIdUsuarioAndMedicoIdUsuarioAndDataHoraAfterOrderByDataHoraAsc(pacienteId, medicoId, LocalDateTime.now())
        .map(Agendamento::getDataHora).orElse(null);

    // --- LÓGICA ATUALIZADA ---

    // 1. Busca o histórico de consultas já ATENDIDAS (como antes)
    List<ProntuarioDTO.ConsultaAnteriorDTO> historico = agendamentoRepository
        .findAllByPacienteIdUsuarioAndMedicoIdUsuarioAndStatus(pacienteId, medicoId, StatusAgendamento.ATENDIDO)
        .stream()
        .map(ag -> new ProntuarioDTO.ConsultaAnteriorDTO(ag.getDataHora(), ag.getFichaMedica().getSintomas(), ag.getFichaMedica().getAlergias(), ag.getFichaMedica().getCirurgias()))
        .collect(Collectors.toList());
        
    // 2. Busca a ficha da ÚLTIMA consulta do paciente (independente do status)
    ProntuarioDTO.ConsultaAnteriorDTO fichaMaisRecente = agendamentoRepository
        .findTopByPacienteIdUsuarioOrderByDataHoraDesc(pacienteId)
        .map(ag -> new ProntuarioDTO.ConsultaAnteriorDTO(ag.getDataHora(), ag.getFichaMedica().getSintomas(), ag.getFichaMedica().getAlergias(), ag.getFichaMedica().getCirurgias()))
        .orElse(null);

    // 3. Monta o DTO final com as informações novas
    return new ProntuarioDTO(
        paciente.getIdUsuario(),
        paciente.getUsuario().getNome(),
        paciente.getUsuario().getEmail(),
        paciente.getTelefone(),
        idade,
        totalConsultas,
        temExames,
        proximaConsulta,
        fichaMaisRecente, // Novo campo
        historico
    );
}
}