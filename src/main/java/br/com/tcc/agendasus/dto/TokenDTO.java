package br.com.tcc.agendasus.dto;

public record TokenDTO(
    String token,
    String role,
    String nome
) {}