package br.com.tcc.agendasus.dto;

import java.time.LocalDate;

import br.com.tcc.agendasus.model.entity.Exame;

public record ExameResponseDTO(
    Long id,
    String tipo,
    String resultado,
    LocalDate dataRealizacao,
    AgendamentoResponseDTO.InfoPacienteDTO paciente,
    AgendamentoResponseDTO.InfoMedicoDTO medico
) {
    public ExameResponseDTO(Exame e) {
        this(
            e.getId(),
            e.getTipo(),
            e.getResultado(),
            e.getDataRealizacao(),
            new AgendamentoResponseDTO.InfoPacienteDTO(e.getPaciente().getIdUsuario(), e.getPaciente().getUsuario().getNome()),
            new AgendamentoResponseDTO.InfoMedicoDTO(e.getMedico().getIdUsuario(), e.getMedico().getUsuario().getNome(), e.getMedico().getEspecialidade())
        );
    }
}