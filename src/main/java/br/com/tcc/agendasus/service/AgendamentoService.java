package br.com.tcc.agendasus.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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

import br.com.tcc.agendasus.dto.DTOs.AgendamentoCadastroDTO;
import br.com.tcc.agendasus.dto.DTOs.AgendamentoResponseDTO;
import br.com.tcc.agendasus.dto.DTOs.AgendamentoStatusUpdateDTO;
import br.com.tcc.agendasus.dto.DTOs.FinalizarConsultaDTO;
import br.com.tcc.agendasus.dto.DTOs.HorarioDisponivelDTO;
import br.com.tcc.agendasus.dto.DTOs.ProntuarioDTO;
import br.com.tcc.agendasus.model.entity.Agendamento;
import br.com.tcc.agendasus.model.entity.Atestado;
import br.com.tcc.agendasus.model.entity.Exame;
import br.com.tcc.agendasus.model.entity.FichaMedica;
import br.com.tcc.agendasus.model.entity.Medico;
import br.com.tcc.agendasus.model.entity.Paciente;
import br.com.tcc.agendasus.model.entity.Prescricao;
import br.com.tcc.agendasus.model.entity.UnidadeDeSaude;
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.Role;
import br.com.tcc.agendasus.model.enums.StatusAgendamento;
import br.com.tcc.agendasus.repository.AgendamentoRepository;
import br.com.tcc.agendasus.repository.AtestadoRepository;
import br.com.tcc.agendasus.repository.ExameRepository;
import br.com.tcc.agendasus.repository.FichaMedicaRepository;
import br.com.tcc.agendasus.repository.MedicoRepository;
import br.com.tcc.agendasus.repository.PacienteRepository;
import br.com.tcc.agendasus.repository.PrescricaoRepository;
import jakarta.persistence.EntityNotFoundException;

@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final ObjectMapper objectMapper;
    private final ExameRepository exameRepository;
    private final PrescricaoRepository prescricaoRepository;
    private final AtestadoRepository atestadoRepository;
    private final AuthorizationService authorizationService; // Adicionado

    private static final Map<DayOfWeek, String> DIAS_DA_SEMANA_MAP = Map.of(
        DayOfWeek.MONDAY, "SEGUNDA", DayOfWeek.TUESDAY, "TERCA", DayOfWeek.WEDNESDAY, "QUARTA",
        DayOfWeek.THURSDAY, "QUINTA", DayOfWeek.FRIDAY, "SEXTA", DayOfWeek.SATURDAY, "SABADO",
        DayOfWeek.SUNDAY, "DOMINGO"
    );
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    public AgendamentoService(AgendamentoRepository agendamentoRepository, FichaMedicaRepository fichaMedicaRepository,
                              PacienteRepository pacienteRepository, MedicoRepository medicoRepository,
                              ObjectMapper objectMapper, ExameRepository exameRepository,
                              PrescricaoRepository prescricaoRepository, AtestadoRepository atestadoRepository,
                              AuthorizationService authorizationService) { // Adicionado
        this.agendamentoRepository = agendamentoRepository;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
        this.objectMapper = objectMapper;
        this.exameRepository = exameRepository;
        this.prescricaoRepository = prescricaoRepository;
        this.atestadoRepository = atestadoRepository;
        this.authorizationService = authorizationService; // Adicionado
    }

    @Transactional
    public AgendamentoResponseDTO criarAgendamento(AgendamentoCadastroDTO dados, Authentication authentication) {
        Usuario usuarioLogado = authorizationService.getUsuarioLogado(authentication); // Usa o service
        if (usuarioLogado.getRole() != Role.PACIENTE) {
            throw new AccessDeniedException("Apenas pacientes podem criar agendamentos.");
        }

        Paciente paciente = pacienteRepository.findById(usuarioLogado.getId())
            .orElseThrow(() -> new EntityNotFoundException("Paciente não encontrado para o usuário logado."));

        Medico medico = medicoRepository.findById(dados.idMedico())
            .orElseThrow(() -> new EntityNotFoundException("Médico não encontrado com o ID fornecido."));

        long agendamentosAtivos = agendamentoRepository.countByPacienteIdUsuarioAndMedicoIdUsuarioAndStatusIn(
                paciente.getIdUsuario(),
                medico.getIdUsuario(),
                List.of(StatusAgendamento.PENDENTE, StatusAgendamento.CONFIRMADO));

        if (agendamentosAtivos > 0) {
            throw new IllegalArgumentException(
                    "Você já possui uma consulta ativa (pendente ou confirmada) com este médico. Cancele o agendamento anterior para marcar um novo.");
        }

        validarDisponibilidadeHorario(medico, dados.dataHora());

        FichaMedica novaFicha = new FichaMedica();
        novaFicha.setPaciente(paciente);
        novaFicha.setSintomas(dados.sintomas());
        novaFicha.setDiasSintomas(dados.diasSintomas());
        novaFicha.setAlergias(dados.alergias());
        novaFicha.setCirurgias(dados.cirurgias());

        Agendamento novoAgendamento = new Agendamento();
        novoAgendamento.setPaciente(paciente);
        novoAgendamento.setMedico(medico);
        novoAgendamento.setFichaMedica(novaFicha);
        novoAgendamento.setDataHora(dados.dataHora());
        novoAgendamento.setStatus(StatusAgendamento.PENDENTE);

        Agendamento agendamentoSalvo = agendamentoRepository.save(novoAgendamento);

        // A construção do DTO agora incluirá automaticamente o endereço via construtor
        return new AgendamentoResponseDTO(agendamentoSalvo);
    }

    private void validarDisponibilidadeHorario(Medico medico, LocalDateTime dataHora) {
        String horariosJson = medico.getHorariosDisponiveis();
        boolean horarioDisponivelNoJson = false;

        if (horariosJson != null && !horariosJson.isBlank()) {
            try {
                HorarioDisponivelDTO agenda = objectMapper.readValue(horariosJson, HorarioDisponivelDTO.class);
                String diaDaSemanaReq = DIAS_DA_SEMANA_MAP.get(dataHora.getDayOfWeek());
                LocalTime horaReq = dataHora.toLocalTime();
                for (HorarioDisponivelDTO.DiaDeTrabalho dia : agenda.dias()) {
                    if (dia.dia().equalsIgnoreCase(diaDaSemanaReq)) {
                        for (String horarioStr : dia.horarios()) {
                            LocalTime horarioDisponivel = LocalTime.parse(horarioStr, TIME_FORMATTER);
                            if (horarioDisponivel.equals(horaReq)) {
                                horarioDisponivelNoJson = true;
                                break;
                            }
                        }
                    }
                    if (horarioDisponivelNoJson) {
                        break;
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
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
        Usuario usuarioLogado = authorizationService.getUsuarioLogado(authentication); // Usa o service
        List<Agendamento> agendamentos;
        if (usuarioLogado.getRole() == Role.PACIENTE) {
            agendamentos = agendamentoRepository.findAllByPacienteIdUsuario(usuarioLogado.getId());
        } else if (usuarioLogado.getRole() == Role.MEDICO) {
            agendamentos = agendamentoRepository.findAllByMedicoIdUsuario(usuarioLogado.getId());
        } else {
            return List.of();
        }
        // A construção do DTO agora incluirá automaticamente o endereço via construtor
        return agendamentos.stream().map(AgendamentoResponseDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LocalDateTime> listarHorariosOcupadosPorMedico(Long medicoId) {
        return agendamentoRepository.findDataHoraByMedicoIdUsuarioAndStatusIn(
            medicoId,
            List.of(StatusAgendamento.PENDENTE, StatusAgendamento.CONFIRMADO)
        );
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponseDTO> listarTodosAgendamentos() {
        // A construção do DTO agora incluirá automaticamente o endereço via construtor
        return agendamentoRepository.findAll().stream().map(AgendamentoResponseDTO::new).collect(Collectors.toList());
    }

    @Transactional
    public AgendamentoResponseDTO atualizarStatus(Long agendamentoId, AgendamentoStatusUpdateDTO dados, Authentication authentication) {
        Usuario usuarioLogado = authorizationService.getUsuarioLogado(authentication); // Usa o service
        if (usuarioLogado.getRole() != Role.MEDICO) {
            throw new AccessDeniedException("Apenas médicos podem atualizar o status.");
        }
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new EntityNotFoundException("Agendamento não encontrado com o ID: " + agendamentoId));
        if (!agendamento.getMedico().getIdUsuario().equals(usuarioLogado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para alterar um agendamento que não é seu.");
        }
        agendamento.setStatus(dados.novoStatus());
        // A construção do DTO agora incluirá automaticamente o endereço via construtor
        return new AgendamentoResponseDTO(agendamentoRepository.save(agendamento));
    }

    @Transactional
    public AgendamentoResponseDTO cancelarAgendamentoPaciente(Long agendamentoId, Authentication authentication) {
        Usuario usuarioLogado = authorizationService.getUsuarioLogado(authentication); // Usa o service
        if (usuarioLogado.getRole() != Role.PACIENTE) {
            throw new AccessDeniedException("Apenas pacientes podem cancelar agendamentos.");
        }
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new EntityNotFoundException("Agendamento não encontrado."));
        if (!agendamento.getPaciente().getIdUsuario().equals(usuarioLogado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para cancelar um agendamento que não é seu.");
        }
        StatusAgendamento statusAtual = agendamento.getStatus();
        if (statusAtual != StatusAgendamento.PENDENTE && statusAtual != StatusAgendamento.CONFIRMADO) {
            throw new IllegalArgumentException("Este agendamento não pode mais ser cancelado (Status: " + statusAtual + ").");
        }
        agendamento.setStatus(StatusAgendamento.CANCELADO);
        // A construção do DTO agora incluirá automaticamente o endereço via construtor
        return new AgendamentoResponseDTO(agendamentoRepository.save(agendamento));
    }

    @Transactional(readOnly = true)
    public ProntuarioDTO getProntuarioDoAgendamento(Long agendamentoId, Authentication authentication) {
        Usuario usuarioLogado = authorizationService.getUsuarioLogado(authentication); // Usa o service
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new EntityNotFoundException("Agendamento não encontrado."));

        // A verificação de permissão agora usa o AuthorizationService
        authorizationService.verificarSePodeAcessarAgendamento(authentication, agendamento);

        Paciente paciente = agendamento.getPaciente();
        Medico medico = agendamento.getMedico();

        Integer idade = (paciente.getDataNascimento() != null)
                ? Period.between(paciente.getDataNascimento(), LocalDate.now()).getYears()
                : null;

        long totalConsultas = agendamentoRepository.countByPacienteIdUsuarioAndMedicoIdUsuarioAndStatus(paciente.getIdUsuario(), medico.getIdUsuario(), StatusAgendamento.ATENDIDO);
        LocalDateTime proximaConsulta = agendamentoRepository.findFirstByPacienteIdUsuarioAndMedicoIdUsuarioAndDataHoraAfterOrderByDataHoraAsc(paciente.getIdUsuario(), medico.getIdUsuario(), LocalDateTime.now()).map(Agendamento::getDataHora).orElse(null);

        ProntuarioDTO.ConsultaDetalhesDTO detalhesDaConsulta = criarConsultaDetalhesDTO(agendamento);
        List<ProntuarioDTO.ConsultaAnteriorDTO> historico = criarHistoricoDTO(paciente.getIdUsuario(), medico.getIdUsuario(), agendamento.getId());

        return new ProntuarioDTO(
            paciente.getIdUsuario(),
            paciente.getUsuario().getNome(),
            idade,
            paciente.getTelefone(),
            totalConsultas,
            proximaConsulta,
            detalhesDaConsulta,
            historico
        );
    }

    @Transactional
    public void finalizarConsulta(Long agendamentoId, FinalizarConsultaDTO dados, Authentication authentication) {
        Usuario medicoLogado = authorizationService.getUsuarioLogado(authentication); // Usa o service
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new EntityNotFoundException("Agendamento não encontrado."));

        if (!agendamento.getMedico().getIdUsuario().equals(medicoLogado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para finalizar este agendamento.");
        }

        agendamento.setStatus(StatusAgendamento.ATENDIDO);
        FichaMedica ficha = agendamento.getFichaMedica();
        ficha.setEvolucaoMedica(dados.evolucaoMedica());

        if (dados.prescricao() != null && !dados.prescricao().isBlank()) {
            Prescricao novaPrescricao = new Prescricao();
            novaPrescricao.setAgendamento(agendamento);
            novaPrescricao.setMedico(agendamento.getMedico());
            novaPrescricao.setPaciente(agendamento.getPaciente());
            novaPrescricao.setMedicamentos(dados.prescricao());
            novaPrescricao.setDataEmissao(LocalDate.now());
            prescricaoRepository.save(novaPrescricao);
        }
        if (dados.exames() != null && !dados.exames().isEmpty()) {
            for (String tipoExame : dados.exames()) {
                Exame novoExame = new Exame();
                novoExame.setAgendamento(agendamento);
                novoExame.setMedico(agendamento.getMedico());
                novoExame.setPaciente(agendamento.getPaciente());
                novoExame.setTipo(tipoExame);
                novoExame.setDataRealizacao(LocalDate.now()); // Data da solicitação, pode ser ajustado
                exameRepository.save(novoExame);
            }
        }
        if (dados.diasDeRepouso() != null && dados.diasDeRepouso() > 0) {
            UnidadeDeSaude unidade = agendamento.getMedico().getUnidade();
            String descricaoAtestado = String.format(
                "Atestado para os devidos fins que o(a) paciente %s foi atendido(a) na unidade %s no dia %s, necessitando de %d dias de repouso.",
                agendamento.getPaciente().getUsuario().getNome(),
                unidade != null ? unidade.getNome() : "[Unidade não informada]",
                agendamento.getDataHora().toLocalDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                dados.diasDeRepouso()
            );
            Atestado novoAtestado = new Atestado();
            novoAtestado.setAgendamento(agendamento);
            novoAtestado.setMedico(agendamento.getMedico());
            novoAtestado.setPaciente(agendamento.getPaciente());
            novoAtestado.setDescricao(descricaoAtestado);
            novoAtestado.setDataEmissao(LocalDate.now());
            atestadoRepository.save(novoAtestado);
        }
        agendamentoRepository.save(agendamento); // Salva a ficha médica atualizada e o status do agendamento
    }

    private ProntuarioDTO.ConsultaDetalhesDTO criarConsultaDetalhesDTO(Agendamento agendamento) {
        FichaMedica fichaAtual = agendamento.getFichaMedica();
        // Busca a prescrição associada, se existir
        String prescricaoTexto = prescricaoRepository.findByAgendamentoId(agendamento.getId()).map(Prescricao::getMedicamentos).orElse(null);
        // Busca os exames solicitados, se existirem
        List<String> examesSolicitados = exameRepository.findAllByAgendamentoId(agendamento.getId()).stream().map(Exame::getTipo).collect(Collectors.toList());
        return new ProntuarioDTO.ConsultaDetalhesDTO(
                agendamento.getDataHora(), fichaAtual.getSintomas(), fichaAtual.getEvolucaoMedica(),
                prescricaoTexto, examesSolicitados, fichaAtual.getAlergias(),
                fichaAtual.getCirurgias(), fichaAtual.getDiasSintomas()
        );
    }

    private List<ProntuarioDTO.ConsultaAnteriorDTO> criarHistoricoDTO(Long pacienteId, Long medicoId, Long agendamentoAtualId) {
        return agendamentoRepository
                .findAllByPacienteIdUsuarioAndMedicoIdUsuarioAndStatus(pacienteId, medicoId, StatusAgendamento.ATENDIDO)
                .stream()
                // Garante que a consulta atual não entre no histórico dela mesma
                .filter(ag -> !ag.getId().equals(agendamentoAtualId))
                .map(ag -> new ProntuarioDTO.ConsultaAnteriorDTO(ag.getDataHora(), ag.getFichaMedica() != null ? ag.getFichaMedica().getSintomas() : "Sintomas não registrados")) // Adiciona verificação de ficha nula
                .collect(Collectors.toList());
    }
}
