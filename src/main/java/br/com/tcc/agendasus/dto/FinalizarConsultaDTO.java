package br.com.tcc.agendasus.dto;

import java.util.List;

public record FinalizarConsultaDTO(
    String evolucaoMedica,
    String prescricao, 
    List<String> exames 
) {}