package br.com.tcc.agendasus.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional; // Import Optional
import java.util.UUID; // Import UUID
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service; // Import Authentication
import org.springframework.transaction.annotation.Transactional;

import br.com.tcc.agendasus.dto.DTOs.*; // Import Diretor
import br.com.tcc.agendasus.dto.DTOs.ForgotPasswordRequestDTO;   // Import Medico
import br.com.tcc.agendasus.dto.DTOs.PacienteUpdateDTO;
import br.com.tcc.agendasus.dto.DTOs.ResetPasswordRequestDTO;
import br.com.tcc.agendasus.dto.DTOs.UsuarioCadastroDTO;
import br.com.tcc.agendasus.dto.DTOs.UsuarioResponseDTO; // Import DiretorRepository
import br.com.tcc.agendasus.dto.DTOs.UsuarioUpdateDTO;   // Import MedicoRepository
import br.com.tcc.agendasus.model.entity.Diretor;
import br.com.tcc.agendasus.model.entity.Medico;
import br.com.tcc.agendasus.model.entity.Paciente;
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.Role; // Import AccessDeniedException
import br.com.tcc.agendasus.repository.DiretorRepository;
import br.com.tcc.agendasus.repository.MedicoRepository;
import br.com.tcc.agendasus.repository.PacienteRepository;
import br.com.tcc.agendasus.repository.UsuarioRepository;
import br.com.tcc.agendasus.service.security.TokenService;
import jakarta.persistence.EntityNotFoundException;


@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;     // Injetar MedicoRepository
    private final DiretorRepository diretorRepository;   // Injetar DiretorRepository
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final AuthorizationService authorizationService;

    public UsuarioService(UsuarioRepository usuarioRepository, PacienteRepository pacienteRepository,
                          MedicoRepository medicoRepository, DiretorRepository diretorRepository, // Adicionar aos parâmetros
                          PasswordEncoder passwordEncoder, TokenService tokenService,
                          AuthorizationService authorizationService) {
        this.usuarioRepository = usuarioRepository;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;         // Atribuir
        this.diretorRepository = diretorRepository;       // Atribuir
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

        // Retorna o DTO completo com dados do paciente
        return new UsuarioResponseDTO(usuarioSalvo, Optional.of(novoPaciente), Optional.empty(), Optional.empty());
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        // Mapeia para o DTO simplificado, pois não precisamos dos detalhes específicos aqui
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponseDTO::new) // Usa o construtor que aceita só Usuario
                .collect(Collectors.toList());
    }

    // [MODIFICADO] Método para buscar o perfil completo do usuário logado (incluindo dados específicos do Role)
    @Transactional(readOnly = true)
    public UsuarioResponseDTO getMeuPerfilCompleto(Authentication auth) {
        Usuario usuarioLogado = authorizationService.getUsuarioLogado(auth);
        Optional<Paciente> pacienteOpt = Optional.empty();
        Optional<Medico> medicoOpt = Optional.empty();
        Optional<Diretor> diretorOpt = Optional.empty();

        switch (usuarioLogado.getRole()) {
            case PACIENTE:
                pacienteOpt = pacienteRepository.findById(usuarioLogado.getId());
                break;
            case MEDICO:
                medicoOpt = medicoRepository.findById(usuarioLogado.getId());
                break;
            case DIRETOR:
                diretorOpt = diretorRepository.findById(usuarioLogado.getId());
                break;
        }
        // Usa o construtor do DTO que aceita todos os Optionals
        return new UsuarioResponseDTO(usuarioLogado, pacienteOpt, medicoOpt, diretorOpt);
    }


    @Transactional
    public UsuarioResponseDTO atualizarUsuario(Long id, UsuarioUpdateDTO dadosUpdate, Authentication auth) {
         // Validação para garantir que o usuário só pode alterar o próprio nome/senha (ou se for admin)
        authorizationService.verificarSePodeAlterarRecurso(auth, id);

        Usuario usuario = findById(id);

        // Atualiza Nome se fornecido
        if (dadosUpdate.nome() != null && !dadosUpdate.nome().isBlank()) {
            usuario.setNome(dadosUpdate.nome());
        }
        // Atualiza Senha se fornecida
        if (dadosUpdate.senha() != null && !dadosUpdate.senha().isBlank()) {
             // Valida a força da senha aqui se necessário
            if (dadosUpdate.senha().length() < 6 || !dadosUpdate.senha().matches(".*\\d.*")) {
                 throw new IllegalArgumentException("A nova senha deve ter pelo menos 6 caracteres e conter um número.");
            }
            usuario.setSenha(passwordEncoder.encode(dadosUpdate.senha()));
        }

        Usuario usuarioAtualizado = usuarioRepository.save(usuario);

        // Busca novamente os detalhes específicos para retornar o DTO completo
        // (Poderia otimizar, mas assim garante consistência)
        Optional<Paciente> pacienteOpt = (usuarioAtualizado.getRole() == Role.PACIENTE) ? pacienteRepository.findById(id) : Optional.empty();
        Optional<Medico> medicoOpt = (usuarioAtualizado.getRole() == Role.MEDICO) ? medicoRepository.findById(id) : Optional.empty();
        Optional<Diretor> diretorOpt = (usuarioAtualizado.getRole() == Role.DIRETOR) ? diretorRepository.findById(id) : Optional.empty();

        return new UsuarioResponseDTO(usuarioAtualizado, pacienteOpt, medicoOpt, diretorOpt);
    }

    // Método para atualizar dados específicos do Paciente (mantido igual)
    @Transactional
    public UsuarioResponseDTO atualizarDadosPaciente(Long idUsuario, PacienteUpdateDTO dadosPaciente, Authentication auth) {
        Usuario usuarioLogado = authorizationService.getUsuarioLogado(auth);

        // Garante que o usuário logado é o mesmo que está sendo atualizado e que ele é um PACIENTE
        if (!usuarioLogado.getId().equals(idUsuario) || usuarioLogado.getRole() != Role.PACIENTE) {
            throw new AccessDeniedException("Você não tem permissão para alterar os dados deste paciente.");
        }

        // Busca o Paciente associado ao Usuario
        Paciente paciente = pacienteRepository.findById(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Dados do paciente não encontrados para o usuário ID: " + idUsuario));

        // Atualiza os campos do Paciente se eles foram fornecidos no DTO
        if (dadosPaciente.telefone() != null) {
            paciente.setTelefone(dadosPaciente.telefone().isBlank() ? null : dadosPaciente.telefone());
        }
        if (dadosPaciente.cep() != null) {
            paciente.setCep(dadosPaciente.cep().isBlank() ? null : dadosPaciente.cep());
        }
        if (dadosPaciente.cidade() != null) {
            paciente.setCidade(dadosPaciente.cidade().isBlank() ? null : dadosPaciente.cidade());
        }
        if (dadosPaciente.estado() != null) {
            paciente.setEstado(dadosPaciente.estado().isBlank() ? null : dadosPaciente.estado());
        }
        if (dadosPaciente.numero() != null) {
            paciente.setNumero(dadosPaciente.numero().isBlank() ? null : dadosPaciente.numero());
        }
        if (dadosPaciente.complemento() != null) {
            paciente.setComplemento(dadosPaciente.complemento().isBlank() ? null : dadosPaciente.complemento());
        }

        Paciente pacienteAtualizado = pacienteRepository.save(paciente);

        // Retorna o DTO completo com os dados atualizados
        return new UsuarioResponseDTO(usuarioLogado, Optional.of(pacienteAtualizado), Optional.empty(), Optional.empty());
    }


    @Transactional
    public void desativarUsuario(Long id) {
        Usuario usuario = findById(id);
        // Adicionar validação para não desativar a si mesmo? Ou o único admin?
        // if (usuario.getId().equals(authorizationService.getUsuarioLogado(auth).getId())) {
        //     throw new IllegalArgumentException("Você não pode desativar a si mesmo.");
        // }
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }

    // Método para reativar usuário (chamado pelo Admin/Diretor)
    @Transactional
    public void reativarUsuario(Long id) {
        Usuario usuario = findById(id);
        usuario.setAtivo(true);
        usuarioRepository.save(usuario);
    }

    // Gerar Token de Reset de Senha (mantido igual)
    @Transactional
    public String gerarTokenResetSenha(ForgotPasswordRequestDTO dados) {
        Usuario usuario = usuarioRepository.findByEmail(dados.email())
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com o e-mail fornecido."));

        String token = UUID.randomUUID().toString();
        usuario.setResetToken(token);
        usuario.setResetTokenExpiry(LocalDateTime.now().plusHours(1)); // 1 hora de validade
        usuarioRepository.save(usuario);
        System.out.println("---- DEBUG: Token de Reset Gerado para " + dados.email() + ": " + token + " ----");
        return token;
    }

    // Redefinir Senha (mantido igual)
    @Transactional
    public void redefinirSenha(ResetPasswordRequestDTO dados) {
        if (dados.token() == null || dados.token().isBlank()) {
            throw new IllegalArgumentException("Token inválido ou não fornecido.");
        }
        Usuario usuario = usuarioRepository.findByResetToken(dados.token())
                .orElseThrow(() -> new IllegalArgumentException("Token inválido ou não encontrado."));

        if (usuario.getResetTokenExpiry() == null || usuario.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            usuario.setResetToken(null);
            usuario.setResetTokenExpiry(null);
            usuarioRepository.save(usuario);
            throw new IllegalArgumentException("Token expirado. Por favor, solicite um novo.");
        }
        if (dados.novaSenha() == null || dados.novaSenha().length() < 6 || !dados.novaSenha().matches(".*\\d.*")) {
             throw new IllegalArgumentException("A nova senha deve ter pelo menos 6 caracteres e conter um número.");
        }
        usuario.setSenha(passwordEncoder.encode(dados.novaSenha()));
        usuario.setResetToken(null); // Limpa o token após o uso
        usuario.setResetTokenExpiry(null);
        usuarioRepository.save(usuario);
    }

    // Método auxiliar privado para buscar usuário ou lançar exceção
    private Usuario findById(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com o ID: " + id));
    }
}

