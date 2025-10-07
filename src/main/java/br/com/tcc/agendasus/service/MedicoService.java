package br.com.tcc.agendasus.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.tcc.agendasus.dto.DTOs.*;
import br.com.tcc.agendasus.dto.DTOs.HorarioDisponivelDTO;
import br.com.tcc.agendasus.dto.DTOs.MedicoCadastroDTO;
import br.com.tcc.agendasus.dto.DTOs.MedicoResponseDTO;
import br.com.tcc.agendasus.dto.DTOs.MedicoUpdateDTO;
import br.com.tcc.agendasus.model.entity.Medico;
import br.com.tcc.agendasus.model.entity.UnidadeDeSaude;
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.Role;
import br.com.tcc.agendasus.repository.MedicoRepository;
import br.com.tcc.agendasus.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;

@Service
public class MedicoService {

    private final MedicoRepository medicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final UnidadeDeSaudeService unidadeDeSaudeService;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    public MedicoService(MedicoRepository medicoRepository, UsuarioRepository usuarioRepository,
                         UnidadeDeSaudeService unidadeDeSaudeService, PasswordEncoder passwordEncoder,
                         ObjectMapper objectMapper) {
        this.medicoRepository = medicoRepository;
        this.usuarioRepository = usuarioRepository;
        this.unidadeDeSaudeService = unidadeDeSaudeService;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public MedicoResponseDTO cadastrarMedico(MedicoCadastroDTO dados) {
        if (usuarioRepository.existsByEmail(dados.email())) {
            throw new IllegalArgumentException("E-mail já cadastrado.");
        }
        if (usuarioRepository.existsByCpf(dados.cpf())) {
            throw new IllegalArgumentException("CPF já cadastrado.");
        }

        UnidadeDeSaude unidade = unidadeDeSaudeService.findById(dados.idUnidade());

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
        novoMedico.setUnidade(unidade);
        
        return new MedicoResponseDTO(medicoRepository.save(novoMedico));
    }

    /**
     * CORREÇÃO: A anotação @Transactional é crucial aqui. Sem ela, ao tentar
     * acessar medico.getUsuario() ou medico.getUnidade() dentro do construtor do DTO,
     * a sessão do banco de dados já teria sido fechada, causando um LazyInitializationException.
     * A anotação mantém a sessão aberta durante toda a execução do método.
     */
    @Transactional(readOnly = true)
    public List<MedicoResponseDTO> listarTodos() {
        return medicoRepository.findAll().stream()
                .map(MedicoResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public MedicoResponseDTO getMedicoPorId(Long id) {
        return new MedicoResponseDTO(findById(id));
    }

    @Transactional
    public MedicoResponseDTO atualizarMedico(Long id, MedicoUpdateDTO dados) {
        Medico medico = findById(id);
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
        return new MedicoResponseDTO(medicoRepository.save(medico));
    }
    
    @Transactional
    public void atualizarHorarios(Long medicoId, HorarioDisponivelDTO horariosDTO) {
        Medico medico = findById(medicoId);
        try {
            medico.setHorariosDisponiveis(objectMapper.writeValueAsString(horariosDTO));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Erro ao processar os horários.", e);
        }
        medicoRepository.save(medico);
    }

    @Transactional(readOnly = true)
    public HorarioDisponivelDTO getHorariosDoMedico(Long idMedico) {
        Medico medico = findById(idMedico);
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

    public Medico findById(Long id) {
        return medicoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Médico não encontrado com o ID: " + id));
    }
}

