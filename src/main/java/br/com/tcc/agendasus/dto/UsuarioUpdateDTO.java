package br.com.tcc.agendasus.dto;

import jakarta.validation.constraints.Size;

public record UsuarioUpdateDTO(
    String nome,

    @Size(min = 6, message = "A nova senha deve ter no mínimo 6 caracteres")
    String senha
) {}