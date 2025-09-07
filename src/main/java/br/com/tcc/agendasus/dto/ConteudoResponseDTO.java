package br.com.tcc.agendasus.dto;

import java.time.LocalDateTime;

import br.com.tcc.agendasus.model.entity.Conteudo;
import br.com.tcc.agendasus.model.enums.StatusConteudo;
import br.com.tcc.agendasus.model.enums.TipoConteudo;

public record ConteudoResponseDTO(
    Long id,
    TipoConteudo tipo,
    String titulo,
    String corpo,
    StatusConteudo status,
    LocalDateTime publicadoEm,
    AutorDTO autor
) {
    public record AutorDTO(Long id, String nome) {}

    public ConteudoResponseDTO(Conteudo c) {
        this(
            c.getId(),
            c.getTipo(),
            c.getTitulo(),
            c.getCorpo(),
            c.getStatus(),
            c.getPublicadoEm(),
            new AutorDTO(c.getAutor().getId(), c.getAutor().getNome())
        );
    }
}