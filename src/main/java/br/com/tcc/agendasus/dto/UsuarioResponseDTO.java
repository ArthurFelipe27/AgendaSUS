package br.com.tcc.agendasus.dto;

import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.Role;

public record UsuarioResponseDTO(
    Long id,
    String nome,
    String email,
    String cpf,
    Role role,
    boolean ativo // Adicionado para a lista de admin
) {
    public UsuarioResponseDTO(Usuario usuario) {
        this(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getCpf(), usuario.getRole(), usuario.isAtivo());
    }
}