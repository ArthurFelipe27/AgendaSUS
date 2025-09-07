package br.com.tcc.agendasus.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AgendamentoCadastroDTO(
    @NotNull Long idMedico,
    @NotNull @Future @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime dataHora,
    @NotBlank String sintomas,
    Integer diasSintomas,
    String alergias,
    String cirurgias
) {}