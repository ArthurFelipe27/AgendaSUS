package br.com.tcc.agendasus.dto;

import br.com.tcc.agendasus.model.enums.StatusConteudo;
import br.com.tcc.agendasus.model.enums.TipoConteudo;

public record ConteudoUpdateDTO(
    String titulo,
    String corpo,
    TipoConteudo tipo,
    StatusConteudo status
) {}