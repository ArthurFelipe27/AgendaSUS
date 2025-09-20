package br.com.tcc.agendasus.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ProntuarioDTO(
    // Dados Pessoais
    Long idPaciente, String nome, String email, String telefone, Integer idade,
     String nomeUnidade,
    String regiaoAdministrativaUnidade,
    // Estatísticas
    long totalConsultasComMedico, boolean temExames, LocalDateTime proximaConsulta,
    // Detalhes da Consulta
    ConsultaDetalhesDTO detalhesDaConsulta, 
    // Histórico de Outras Consultas
    List<ConsultaAnteriorDTO> historicoConsultas
) {
    // DTO para os detalhes da consulta SELECIONADA
    public record ConsultaDetalhesDTO(
        LocalDateTime data, String sintomas, String evolucaoMedica,
        String prescricao, List<String> exames, String alergias, String cirurgias, Integer diasSintomas
    ) {}

    // DTO para as consultas do histórico
    public record ConsultaAnteriorDTO(LocalDateTime data, String sintomas) {}
}