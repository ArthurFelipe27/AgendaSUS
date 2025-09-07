package br.com.tcc.agendasus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PrescricaoCadastroDTO(
    @NotNull Long idPaciente,
    @NotBlank String medicamentos
) {}