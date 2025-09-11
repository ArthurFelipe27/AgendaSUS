package br.com.tcc.agendasus.service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.tcc.agendasus.dto.HorarioDisponivelDTO;
import br.com.tcc.agendasus.dto.MedicoCadastroDTO;
import br.com.tcc.agendasus.dto.MedicoResponseDTO;
import br.com.tcc.agendasus.dto.MedicoUpdateDTO;
import br.com.tcc.agendasus.model.entity.Agendamento;
import br.com.tcc.agendasus.model.entity.Medico;
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.Role;
import br.com.tcc.agendasus.model.enums.StatusAgendamento;
import br.com.tcc.agendasus.repository.AgendamentoRepository;
import br.com.tcc.agendasus.repository.MedicoRepository;
import br.com.tcc.agendasus.repository.UsuarioRepository;

@Service
public class MedicoService {

    private final UsuarioRepository usuarioRepository;
    private final MedicoRepository medicoRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;
    private final AgendamentoRepository agendamentoRepository; // NOVA DEPENDÊNCIA

    // CONSTRUTOR ATUALIZADO
    public MedicoService(UsuarioRepository usuarioRepository, MedicoRepository medicoRepository,
                         PasswordEncoder passwordEncoder, ObjectMapper objectMapper,
                         AgendamentoRepository agendamentoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.medicoRepository = medicoRepository;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
        this.agendamentoRepository = agendamentoRepository; // INJETADA AQUI
    }

    @Transactional
    public MedicoResponseDTO cadastrarMedico(MedicoCadastroDTO dados) {
        if (usuarioRepository.findByEmail(dados.email()).isPresent()) {
            throw new IllegalArgumentException("E-mail já cadastrado.");
        }
        if (usuarioRepository.findByCpf(dados.cpf()).isPresent()) {
            throw new IllegalArgumentException("CPF já cadastrado.");
        }

        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome(dados.nome());
        novoUsuario.setEmail(dados.email());
        novoUsuario.setCpf(dados.cpf());
        novoUsuario.setCrm(dados.crm());
        novoUsuario.setSenha(passwordEncoder.encode(dados.senha()));
        novoUsuario.setRole(Role.MEDICO);
        novoUsuario.setAtivo(true);
        Usuario usuarioSalvo = usuarioRepository.save(novoUsuario);

        Medico novoMedico = new Medico();
        novoMedico.setUsuario(usuarioSalvo);
        novoMedico.setEspecialidade(dados.especialidade());
        
        Medico medicoSalvo = medicoRepository.save(novoMedico);
        return new MedicoResponseDTO(medicoSalvo);
    }

    @Transactional(readOnly = true)
    public List<MedicoResponseDTO> listarTodos() {
        return medicoRepository.findAll()
                .stream()
                .map(MedicoResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public MedicoResponseDTO getMedicoPorId(Long id) {
        return medicoRepository.findById(id)
                .map(MedicoResponseDTO::new)
                .orElseThrow(() -> new RuntimeException("Médico não encontrado com o ID: " + id));
    }


    @Transactional
    public MedicoResponseDTO atualizarMedico(Long id, MedicoUpdateDTO dados) {
        Medico medico = medicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Médico não encontrado com o ID: " + id));
        Usuario usuario = medico.getUsuario();

        if (dados.nome() != null && !dados.nome().isBlank()) {
            usuario.setNome(dados.nome());
        }
        if (dados.crm() != null && !dados.crm().isBlank()) {
            usuario.setCrm(dados.crm());
        }
        if (dados.especialidade() != null && !dados.especialidade().isBlank()) {
            medico.setEspecialidade(dados.especialidade());
        }
        if (dados.ativo() != null) {
            usuario.setAtivo(dados.ativo());
        }

        usuarioRepository.save(usuario);
        Medico medicoAtualizado = medicoRepository.save(medico);
        return new MedicoResponseDTO(medicoAtualizado);
    }

    @Transactional
    public void desativarMedico(Long id) {
        Medico medico = medicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Médico não encontrado com o ID: " + id));
        Usuario usuario = medico.getUsuario();
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void atualizarHorarios(HorarioDisponivelDTO horariosDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Usuario medicoLogado = (Usuario) authentication.getPrincipal();

        Medico medico = medicoRepository.findById(medicoLogado.getId())
                .orElseThrow(() -> new RuntimeException("Médico não encontrado."));

        try {
            String horariosJson = objectMapper.writeValueAsString(horariosDTO);
            medico.setHorariosDisponiveis(horariosJson);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Erro ao processar os horários.", e);
        }

        medicoRepository.save(medico);
    }

    /**
     * MÉTODO ATUALIZADO: Agora filtra os horários já ocupados.
     */
    @Transactional(readOnly = true)
    public HorarioDisponivelDTO getHorariosDoMedico(Long idMedico) {
        Medico medico = medicoRepository.findById(idMedico)
                .orElseThrow(() -> new RuntimeException("Médico não encontrado com o ID: " + idMedico));

        String horariosJson = medico.getHorariosDisponiveis();

        if (horariosJson == null || horariosJson.isBlank()) {
            return new HorarioDisponivelDTO(new ArrayList<>());
        }

        try {
            // 1. Pega a agenda BASE do médico (do JSON)
            HorarioDisponivelDTO agendaBase = objectMapper.readValue(horariosJson, HorarioDisponivelDTO.class);

            // 2. Busca no banco TODOS os horários JÁ AGENDADOS para este médico no futuro
            List<StatusAgendamento> statusOcupados = Arrays.asList(StatusAgendamento.PENDENTE, StatusAgendamento.CONFIRMADO);
            List<Agendamento> agendamentosFuturos = agendamentoRepository
                    .findByMedicoIdUsuarioAndStatusInAndDataHoraAfter(idMedico, statusOcupados, LocalDateTime.now());
            
            Set<LocalDateTime> horariosOcupados = agendamentosFuturos.stream()
                    .map(Agendamento::getDataHora)
                    .collect(Collectors.toSet());

            // 3. FILTRA a agenda base, removendo os horários já ocupados
            List<HorarioDisponivelDTO.DiaDeTrabalho> diasDisponiveis = new ArrayList<>();
            
            for (HorarioDisponivelDTO.DiaDeTrabalho dia : agendaBase.dias()) {
                List<String> horariosLivres = new ArrayList<>();
                for (String hora : dia.horarios()) {
                    LocalDateTime dataSlotCompleta = getProximaData(dia.dia(), hora);
                    
                    if (!horariosOcupados.contains(dataSlotCompleta)) {
                        horariosLivres.add(hora);
                    }
                }
                if (!horariosLivres.isEmpty()) {
                    diasDisponiveis.add(new HorarioDisponivelDTO.DiaDeTrabalho(dia.dia(), horariosLivres));
                }
            }

            return new HorarioDisponivelDTO(diasDisponiveis);

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Erro ao processar a agenda do médico.", e);
        }
    }

    /**
     * NOVO MÉTODO HELPER para calcular as datas dos slots no backend
     */
    private LocalDateTime getProximaData(String diaDaSemana, String horaMinuto) {
        Map<String, DayOfWeek> diasMap = Map.of(
                "SEGUNDA", DayOfWeek.MONDAY, "TERCA", DayOfWeek.TUESDAY, "QUARTA", DayOfWeek.WEDNESDAY,
                "QUINTA", DayOfWeek.THURSDAY, "SEXTA", DayOfWeek.FRIDAY, "SABADO", DayOfWeek.SATURDAY,
                "DOMINGO", DayOfWeek.SUNDAY
        );
        
        DayOfWeek diaAlvo = diasMap.get(diaDaSemana.toUpperCase());
        LocalDateTime agora = LocalDateTime.now();
        
        // Encontra a próxima ocorrência do dia da semana
        LocalDateTime dataAlvo = agora.with(diaAlvo);
        if (dataAlvo.isBefore(agora)) {
            dataAlvo = dataAlvo.plusWeeks(1);
        }

        // Define a hora e zera segundos/nanos
        return dataAlvo.withHour(Integer.parseInt(horaMinuto.substring(0, 2)))
                       .withMinute(Integer.parseInt(horaMinuto.substring(3, 5)))
                       .withSecond(0).withNano(0);
    }
}