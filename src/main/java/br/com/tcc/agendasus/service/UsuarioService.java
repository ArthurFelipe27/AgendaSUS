package br.com.tcc.agendasus.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.tcc.agendasus.dto.DTOs.*;
import br.com.tcc.agendasus.dto.DTOs.ForgotPasswordRequestDTO;
import br.com.tcc.agendasus.dto.DTOs.ResetPasswordRequestDTO;
import br.com.tcc.agendasus.dto.DTOs.UsuarioCadastroDTO;
import br.com.tcc.agendasus.dto.DTOs.UsuarioResponseDTO;
import br.com.tcc.agendasus.dto.DTOs.UsuarioUpdateDTO;
import br.com.tcc.agendasus.model.entity.Paciente;
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.Role;
import br.com.tcc.agendasus.repository.PacienteRepository;
import br.com.tcc.agendasus.repository.UsuarioRepository;
import br.com.tcc.agendasus.service.security.TokenService;
import jakarta.persistence.EntityNotFoundException;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PacienteRepository pacienteRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final AuthorizationService authorizationService;

    public UsuarioService(UsuarioRepository usuarioRepository, PacienteRepository pacienteRepository,
                          PasswordEncoder passwordEncoder, TokenService tokenService,
                          AuthorizationService authorizationService) {
        this.usuarioRepository = usuarioRepository;
        this.pacienteRepository = pacienteRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.authorizationService = authorizationService;
    }

    @Transactional
    public UsuarioResponseDTO cadastrarUsuario(UsuarioCadastroDTO dados) {
        if (usuarioRepository.existsByEmail(dados.email())) {
            throw new IllegalArgumentException("E-mail já cadastrado.");
        }
        if (usuarioRepository.existsByCpf(dados.cpf())) {
            throw new IllegalArgumentException("CPF já cadastrado.");
        }

        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome(dados.nome());
        novoUsuario.setEmail(dados.email());
        novoUsuario.setCpf(dados.cpf());
        novoUsuario.setSenha(passwordEncoder.encode(dados.senha()));
        novoUsuario.setRole(Role.PACIENTE); // Cadastro público é sempre PACIENTE
        Usuario usuarioSalvo = usuarioRepository.save(novoUsuario);

        Paciente novoPaciente = new Paciente();
        novoPaciente.setUsuario(usuarioSalvo);
        novoPaciente.setNomeSocial(dados.nomeSocial());
        novoPaciente.setDataNascimento(dados.dataNascimento());
        novoPaciente.setTelefone(dados.telefone());
        novoPaciente.setSexo(dados.sexo());
        novoPaciente.setCep(dados.cep());
        novoPaciente.setCidade(dados.cidade());
        novoPaciente.setEstado(dados.estado());
        novoPaciente.setNumero(dados.numero());
        novoPaciente.setComplemento(dados.complemento());
        pacienteRepository.save(novoPaciente);

        return new UsuarioResponseDTO(usuarioSalvo);
    }
    
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public UsuarioResponseDTO atualizarUsuario(Long id, UsuarioUpdateDTO dadosUpdate) {
        Usuario usuario = findById(id);

        if (dadosUpdate.nome() != null && !dadosUpdate.nome().isBlank()) {
            usuario.setNome(dadosUpdate.nome());
        }
        if (dadosUpdate.senha() != null && !dadosUpdate.senha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dadosUpdate.senha()));
        }

        return new UsuarioResponseDTO(usuarioRepository.save(usuario));
    }

    @Transactional
    public void desativarUsuario(Long id) {
        Usuario usuario = findById(id);
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }
    
    @Transactional
    public String gerarTokenResetSenha(ForgotPasswordRequestDTO dados) {
        Usuario usuario = usuarioRepository.findByEmail(dados.email())
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com o e-mail fornecido."));

        String token = tokenService.gerarToken(usuario);
        usuario.setResetToken(token);
        usuario.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        usuarioRepository.save(usuario);
        return token;
    }

    @Transactional
    public void redefinirSenha(ResetPasswordRequestDTO dados) {
        Usuario usuario = usuarioRepository.findByResetToken(dados.token())
                .orElseThrow(() -> new IllegalArgumentException("Token inválido ou não encontrado."));

        if (usuario.getResetTokenExpiry() == null || usuario.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            usuario.setResetToken(null);
            usuario.setResetTokenExpiry(null);
            usuarioRepository.save(usuario);
            throw new IllegalArgumentException("Token expirado. Por favor, solicite um novo.");
        }
        
        usuario.setSenha(passwordEncoder.encode(dados.novaSenha()));
        usuario.setResetToken(null);
        usuario.setResetTokenExpiry(null);
        usuarioRepository.save(usuario);
    }

    public Usuario findById(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com o ID: " + id));
    }
}
