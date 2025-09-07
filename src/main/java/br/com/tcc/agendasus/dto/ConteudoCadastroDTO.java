package br.com.tcc.agendasus.dto;

import br.com.tcc.agendasus.model.enums.TipoConteudo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ConteudoCadastroDTO(
    @NotNull TipoConteudo tipo,
    @NotBlank String titulo,
    @NotBlank String corpo
) {}