package br.com.tcc.agendasus.dto;

public record MedicoUpdateDTO(
    String nome,
    String crm,
    String especialidade,
    Boolean ativo
) {}