package br.com.tcc.agendasus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequestDTO(
    @NotBlank
    String token,

    @NotBlank
    @Size(min = 6, message = "A nova senha deve ter no mínimo 6 caracteres")
    String novaSenha
) {}