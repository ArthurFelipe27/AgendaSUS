package br.com.tcc.agendasus.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ProntuarioDTO(
    // Dados Pessoais
    Long idPaciente,
    String nome,
    String email,
    String telefone,
    Integer idade,

    // Estatísticas
    long totalConsultasComMedico,
    boolean temExames,
    LocalDateTime proximaConsulta,

    // NOVO CAMPO: Ficha da consulta mais recente
    ConsultaAnteriorDTO fichaConsultaMaisRecente, 

    // Histórico de consultas já atendidas
    List<ConsultaAnteriorDTO> historicoConsultas
) {
    public record ConsultaAnteriorDTO(
        LocalDateTime data,
        String sintomas,
        String alergias,
        String cirurgias
    ) {}
}