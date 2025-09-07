package br.com.tcc.agendasus.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ExameCadastroDTO(
    @NotNull Long idPaciente,
    @NotBlank String tipo,
    @NotNull LocalDate dataRealizacao
) {}