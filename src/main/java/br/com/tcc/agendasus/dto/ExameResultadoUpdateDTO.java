package br.com.tcc.agendasus.dto;

import jakarta.validation.constraints.NotBlank;

public record ExameResultadoUpdateDTO(
    @NotBlank(message = "O resultado não pode estar em branco.")
    String resultado
) {}