package br.com.tcc.agendasus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AtestadoCadastroDTO(
    @NotNull Long idPaciente,
    @NotBlank String descricao
) {}