package br.com.tcc.agendasus.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.tcc.agendasus.dto.ForgotPasswordRequestDTO;
import br.com.tcc.agendasus.dto.ResetPasswordRequestDTO;
import br.com.tcc.agendasus.dto.UsuarioCadastroDTO;
import br.com.tcc.agendasus.dto.UsuarioResponseDTO;
import br.com.tcc.agendasus.dto.UsuarioUpdateDTO;
import br.com.tcc.agendasus.model.entity.Paciente;
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.Role;
import br.com.tcc.agendasus.repository.PacienteRepository;
import br.com.tcc.agendasus.repository.UsuarioRepository;
import br.com.tcc.agendasus.service.security.TokenService;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final PacienteRepository pacienteRepository; // NOVA DEPENDÊNCIA

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                          TokenService tokenService, PacienteRepository pacienteRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.pacienteRepository = pacienteRepository; // INJETADA AQUI
    }

    @Transactional
    public UsuarioResponseDTO cadastrarUsuario(UsuarioCadastroDTO dados) {
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
        novoUsuario.setSenha(passwordEncoder.encode(dados.senha()));
        novoUsuario.setRole(Role.PACIENTE); // Cadastro público é sempre PACIENTE
        Usuario usuarioSalvo = usuarioRepository.save(novoUsuario);
        
        // CRIA E SALVA A ENTIDADE PACIENTE COM OS DADOS COMPLETOS
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
        return usuarioRepository.findAll()
                .stream()
                .map(UsuarioResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public UsuarioResponseDTO getMeuPerfil(Authentication authentication) {
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();
        return new UsuarioResponseDTO(usuarioLogado); 
    }


    @Transactional
    public UsuarioResponseDTO atualizarUsuario(Long id, UsuarioUpdateDTO dadosUpdate) {
        verificarPermissao(id);

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com o ID: " + id));

        if (dadosUpdate.nome() != null && !dadosUpdate.nome().isBlank()) {
            usuario.setNome(dadosUpdate.nome());
        }
        if (dadosUpdate.senha() != null && !dadosUpdate.senha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dadosUpdate.senha()));
        }

        Usuario usuarioAtualizado = usuarioRepository.save(usuario);
        return new UsuarioResponseDTO(usuarioAtualizado);
    }

    @Transactional
    public void desativarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com o ID: " + id));
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }

    private void verificarPermissao(Long idDoRecurso) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Usuario usuarioAutenticado = (Usuario) authentication.getPrincipal();

        if (usuarioAutenticado.getRole() != Role.DIRETOR && !usuarioAutenticado.getId().equals(idDoRecurso)) {
            throw new AccessDeniedException("Acesso negado: você não tem permissão para modificar este recurso.");
        }
    }

    @Transactional
    public String gerarTokenResetSenha(ForgotPasswordRequestDTO dados) {
        Usuario usuario = usuarioRepository.findByEmail(dados.email())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com o e-mail fornecido."));
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
}