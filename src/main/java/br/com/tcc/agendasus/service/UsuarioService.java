package br.com.tcc.agendasus.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service; // Import corrigido
import org.springframework.transaction.annotation.Transactional;

import br.com.tcc.agendasus.dto.UsuarioCadastroDTO;
import br.com.tcc.agendasus.dto.UsuarioResponseDTO;
import br.com.tcc.agendasus.dto.UsuarioUpdateDTO;
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.Role;
import br.com.tcc.agendasus.repository.UsuarioRepository; // Import necessário

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UsuarioResponseDTO cadastrarUsuario(UsuarioCadastroDTO dadosCadastro) {
        if (usuarioRepository.findByEmail(dadosCadastro.email()).isPresent()) {
            throw new IllegalArgumentException("E-mail já cadastrado.");
        }
        if (usuarioRepository.findByCpf(dadosCadastro.cpf()).isPresent()) {
            throw new IllegalArgumentException("CPF já cadastrado.");
        }

        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome(dadosCadastro.nome());
        novoUsuario.setEmail(dadosCadastro.email());
        novoUsuario.setCpf(dadosCadastro.cpf());
        novoUsuario.setRole(dadosCadastro.role());
        novoUsuario.setSenha(passwordEncoder.encode(dadosCadastro.senha()));

        Usuario usuarioSalvo = usuarioRepository.save(novoUsuario);
        return new UsuarioResponseDTO(usuarioSalvo);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(UsuarioResponseDTO::new)
                .collect(Collectors.toList()); // Usando collect() que é compatível com Java 17
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

    @Transactional(readOnly = true)
    public UsuarioResponseDTO getMeuPerfil(Authentication authentication) {
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();
        return new UsuarioResponseDTO(usuarioLogado); 
    }

    private void verificarPermissao(Long idDoRecurso) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Usuario usuarioAutenticado = (Usuario) authentication.getPrincipal();

        if (usuarioAutenticado.getRole() != Role.DIRETOR && !usuarioAutenticado.getId().equals(idDoRecurso)) {
            throw new AccessDeniedException("Acesso negado: você não tem permissão para modificar este recurso.");
        }
    }
}