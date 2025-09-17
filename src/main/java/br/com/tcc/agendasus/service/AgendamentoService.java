package br.com.tcc.agendasus.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.tcc.agendasus.dto.AgendamentoCadastroDTO;
import br.com.tcc.agendasus.dto.AgendamentoResponseDTO;
import br.com.tcc.agendasus.dto.AgendamentoStatusUpdateDTO;
import br.com.tcc.agendasus.dto.HorarioDisponivelDTO;
import br.com.tcc.agendasus.dto.ProntuarioDTO;
import br.com.tcc.agendasus.model.entity.Agendamento;
import br.com.tcc.agendasus.model.entity.FichaMedica;
import br.com.tcc.agendasus.model.entity.Medico;
import br.com.tcc.agendasus.model.entity.Paciente;
import br.com.tcc.agendasus.model.entity.Usuario; // Import necessário
import br.com.tcc.agendasus.model.enums.Role;
import br.com.tcc.agendasus.model.enums.StatusAgendamento;
import br.com.tcc.agendasus.repository.AgendamentoRepository;
import br.com.tcc.agendasus.repository.ExameRepository;
import br.com.tcc.agendasus.repository.FichaMedicaRepository;
import br.com.tcc.agendasus.repository.MedicoRepository;
import br.com.tcc.agendasus.repository.PacienteRepository;


@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final FichaMedicaRepository fichaMedicaRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final ObjectMapper objectMapper;
    private final ExameRepository exameRepository;


    private static final Map<DayOfWeek, String> DIAS_DA_SEMANA_MAP = Map.of(
        DayOfWeek.MONDAY, "SEGUNDA",
        DayOfWeek.TUESDAY, "TERCA",
        DayOfWeek.WEDNESDAY, "QUARTA",
        DayOfWeek.THURSDAY, "QUINTA",
        DayOfWeek.FRIDAY, "SEXTA",
        DayOfWeek.SATURDAY, "SABADO",
        DayOfWeek.SUNDAY, "DOMINGO"
    );
    
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    public AgendamentoService(AgendamentoRepository agendamentoRepository, FichaMedicaRepository fichaMedicaRepository, 
                                PacienteRepository pacienteRepository, MedicoRepository medicoRepository, ObjectMapper objectMapper,
                                ExameRepository exameRepository) {
        this.agendamentoRepository = agendamentoRepository;
        this.fichaMedicaRepository = fichaMedicaRepository;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
        this.objectMapper = objectMapper;
        this.exameRepository = exameRepository;

    }

    

    @Transactional
    public AgendamentoResponseDTO criarAgendamento(AgendamentoCadastroDTO dados, Authentication authentication) {
        
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();
        if (usuarioLogado.getRole() != Role.PACIENTE) {
            throw new AccessDeniedException("Apenas pacientes podem criar agendamentos.");
        }
        Paciente paciente = pacienteRepository.findById(usuarioLogado.getId())
            .orElseThrow(() -> new RuntimeException("Paciente não encontrado."));

        Medico medico = medicoRepository.findById(dados.idMedico())
            .orElseThrow(() -> new RuntimeException("Médico não encontrado."));

        validarDisponibilidadeHorario(medico, dados.dataHora());

        FichaMedica novaFicha = new FichaMedica();
        novaFicha.setPaciente(paciente);
        novaFicha.setSintomas(dados.sintomas());
        novaFicha.setDiasSintomas(dados.diasSintomas());
        novaFicha.setAlergias(dados.alergias());
        novaFicha.setCirurgias(dados.cirurgias());
        FichaMedica fichaSalva = fichaMedicaRepository.save(novaFicha);

        Agendamento novoAgendamento = new Agendamento();
        novoAgendamento.setPaciente(paciente);
        novoAgendamento.setMedico(medico);
        novoAgendamento.setFichaMedica(fichaSalva);
        novoAgendamento.setDataHora(dados.dataHora());
        novoAgendamento.setStatus(StatusAgendamento.PENDENTE);

        Agendamento agendamentoSalvo = agendamentoRepository.save(novoAgendamento);
        
        return new AgendamentoResponseDTO(agendamentoSalvo);
    }

    private void validarDisponibilidadeHorario(Medico medico, LocalDateTime dataHora) {
        String horariosJson = medico.getHorariosDisponiveis();
        boolean horarioDisponivelNoJson = false;
        
        if (horariosJson != null) {
            try {
                HorarioDisponivelDTO agenda = objectMapper.readValue(horariosJson, HorarioDisponivelDTO.class);
                String diaDaSemanaReq = DIAS_DA_SEMANA_MAP.get(dataHora.getDayOfWeek());
                String horaReq = dataHora.format(TIME_FORMATTER);

                for (HorarioDisponivelDTO.DiaDeTrabalho dia : agenda.dias()) {
                    if (dia.dia().equals(diaDaSemanaReq) && dia.horarios().contains(horaReq)) {
                        horarioDisponivelNoJson = true;
                        break;
                    }
                }
            } catch (Exception e) {
                throw new RuntimeException("Não foi possível processar a agenda do médico.");
            }
        }
        
        if (!horarioDisponivelNoJson) {
            throw new IllegalArgumentException("O médico não atende neste dia e horário.");
        }

        boolean horarioJaAgendado = agendamentoRepository.existsByMedicoIdUsuarioAndDataHora(medico.getIdUsuario(), dataHora);
        if (horarioJaAgendado) {
            throw new IllegalArgumentException("Horário indisponível. Já foi agendado por outro paciente.");
        }
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponseDTO> listarMeusAgendamentos(Authentication authentication) {
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();
        Role role = usuarioLogado.getRole();
        List<Agendamento> agendamentos;

        if (role == Role.PACIENTE) {
            agendamentos = agendamentoRepository.findAllByPacienteIdUsuario(usuarioLogado.getId());
        } else if (role == Role.MEDICO) {
            agendamentos = agendamentoRepository.findAllByMedicoIdUsuario(usuarioLogado.getId());
        } else {
            return List.of(); 
        }

        return agendamentos.stream()
                .map(AgendamentoResponseDTO::new)
                .collect(Collectors.toList()); // Usando collect()
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponseDTO> listarTodosAgendamentos() {
        return agendamentoRepository.findAll()
                .stream()
                .map(AgendamentoResponseDTO::new)
                .collect(Collectors.toList()); // Usando collect()
    }

    @Transactional
    public AgendamentoResponseDTO atualizarStatus(Long agendamentoId, AgendamentoStatusUpdateDTO dados, Authentication authentication) {
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();
        if (usuarioLogado.getRole() != Role.MEDICO) {
            throw new AccessDeniedException("Apenas médicos podem atualizar o status de um agendamento.");
        }

        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado com o ID: " + agendamentoId));

        if (!agendamento.getMedico().getIdUsuario().equals(usuarioLogado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para alterar um agendamento que não é seu.");
        }

        agendamento.setStatus(dados.novoStatus());
        Agendamento agendamentoSalvo = agendamentoRepository.save(agendamento);

        return new AgendamentoResponseDTO(agendamentoSalvo);
    }

    @Transactional
    public AgendamentoResponseDTO cancelarAgendamentoPaciente(Long agendamentoId, Authentication authentication) {
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();
        if (usuarioLogado.getRole() != Role.PACIENTE) {
            throw new AccessDeniedException("Apenas pacientes podem cancelar agendamentos por esta rota.");
        }

        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado."));

        if (!agendamento.getPaciente().getIdUsuario().equals(usuarioLogado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para cancelar um agendamento que não é seu.");
        }

        StatusAgendamento statusAtual = agendamento.getStatus();
        if (statusAtual != StatusAgendamento.PENDENTE && statusAtual != StatusAgendamento.CONFIRMADO) {
            throw new IllegalArgumentException("Este agendamento não pode mais ser cancelado (Status: " + statusAtual + ").");
        }

        agendamento.setStatus(StatusAgendamento.CANCELADO);
        Agendamento agendamentoSalvo = agendamentoRepository.save(agendamento);

        return new AgendamentoResponseDTO(agendamentoSalvo);
    }

   // Em: AgendamentoService.java

// Em: AgendamentoService.java

@Transactional(readOnly = true)
public ProntuarioDTO getProntuarioDoAgendamento(Long agendamentoId, Authentication authentication) {
    Usuario medicoLogado = (Usuario) authentication.getPrincipal();
    Long medicoId = medicoLogado.getId();

    Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
            .orElseThrow(() -> new RuntimeException("Agendamento não encontrado."));

    if (!agendamento.getMedico().getIdUsuario().equals(medicoId)) {
        throw new AccessDeniedException("Você não tem permissão para ver este prontuário.");
    }

    Paciente paciente = agendamento.getPaciente();
    Long pacienteId = paciente.getIdUsuario();

    // --- Cálculos (sem alteração) ---
    Integer idade = (paciente.getDataNascimento() != null) ? Period.between(paciente.getDataNascimento(), LocalDate.now()).getYears() : null;
    long totalConsultas = agendamentoRepository.countByPacienteIdUsuarioAndMedicoIdUsuarioAndStatus(pacienteId, medicoId, StatusAgendamento.ATENDIDO);
    boolean temExames = exameRepository.existsByPacienteIdUsuario(pacienteId);
    LocalDateTime proximaConsulta = agendamentoRepository
        .findFirstByPacienteIdUsuarioAndMedicoIdUsuarioAndDataHoraAfterOrderByDataHoraAsc(pacienteId, medicoId, LocalDateTime.now())
        .map(Agendamento::getDataHora).orElse(null);

    // --- LÓGICA ATUALIZADA ---

    // 1. Busca o histórico de consultas já ATENDIDAS
    List<ProntuarioDTO.ConsultaAnteriorDTO> historico = agendamentoRepository
        .findAllByPacienteIdUsuarioAndMedicoIdUsuarioAndStatus(pacienteId, medicoId, StatusAgendamento.ATENDIDO)
        .stream()
        .map(ag -> new ProntuarioDTO.ConsultaAnteriorDTO(
            ag.getDataHora(),
            ag.getFichaMedica().getSintomas(),
            ag.getFichaMedica().getDiasSintomas(), // <-- CORREÇÃO AQUI
            ag.getFichaMedica().getAlergias(),
            ag.getFichaMedica().getCirurgias()
        ))
        .collect(Collectors.toList());
        
    // 2. Pega a ficha da consulta ATUAL
    FichaMedica fichaAtual = agendamento.getFichaMedica();
    ProntuarioDTO.ConsultaAnteriorDTO fichaConsultaAtual = new ProntuarioDTO.ConsultaAnteriorDTO(
        agendamento.getDataHora(),
        fichaAtual.getSintomas(),
        fichaAtual.getDiasSintomas(), // <-- CORREÇÃO AQUI
        fichaAtual.getAlergias(),
        fichaAtual.getCirurgias()
    );

    return new ProntuarioDTO(
        paciente.getIdUsuario(), paciente.getUsuario().getNome(), paciente.getUsuario().getEmail(),
        paciente.getTelefone(), idade, totalConsultas, temExames, proximaConsulta,
        fichaConsultaAtual, historico
    );
}

   

    
}