package br.com.tcc.agendasus.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

public record HorarioDisponivelDTO(
    @NotEmpty @Valid
    List<DiaDeTrabalho> dias
) {
    public record DiaDeTrabalho(
        @NotBlank
        @Pattern(regexp = "SEGUNDA|TERCA|QUARTA|QUINTA|SEXTA|SABADO|DOMINGO", message = "Dia da semana inválido")
        String dia,

        @NotEmpty
        List<@Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Formato de hora inválido. Use HH:mm") String> horarios
    ) {}
}