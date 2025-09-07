package br.com.tcc.agendasus.service;

import java.util.List;
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
import br.com.tcc.agendasus.model.entity.Medico;
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.Role;
import br.com.tcc.agendasus.repository.MedicoRepository;
import br.com.tcc.agendasus.repository.UsuarioRepository; // Import necessário

@Service
public class MedicoService {

    private final UsuarioRepository usuarioRepository;
    private final MedicoRepository medicoRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper; 

    public MedicoService(UsuarioRepository usuarioRepository, MedicoRepository medicoRepository, PasswordEncoder passwordEncoder, ObjectMapper objectMapper) {
        this.usuarioRepository = usuarioRepository;
        this.medicoRepository = medicoRepository;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
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
                .collect(Collectors.toList()); // Usando collect()
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

    @Transactional(readOnly = true)
    public HorarioDisponivelDTO getHorariosDoMedico(Long idMedico) {
        Medico medico = medicoRepository.findById(idMedico)
                .orElseThrow(() -> new RuntimeException("Médico não encontrado com o ID: " + idMedico));

        String horariosJson = medico.getHorariosDisponiveis();

        if (horariosJson == null || horariosJson.isBlank()) {
            return new HorarioDisponivelDTO(List.of());
        }

        try {
            return objectMapper.readValue(horariosJson, HorarioDisponivelDTO.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Erro ao processar a agenda do médico.", e);
        }
    }

    @Transactional(readOnly = true)
    public MedicoResponseDTO getMedicoPorId(Long id) {
        return medicoRepository.findById(id)
                .map(MedicoResponseDTO::new)
                .orElseThrow(() -> new RuntimeException("Médico não encontrado com o ID: " + id));
    }
}