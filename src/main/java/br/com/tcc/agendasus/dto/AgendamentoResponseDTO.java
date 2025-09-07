package br.com.tcc.agendasus.dto;

import java.time.LocalDateTime;

import br.com.tcc.agendasus.model.entity.Agendamento;
import br.com.tcc.agendasus.model.enums.StatusAgendamento;

public record AgendamentoResponseDTO(
    Long idAgendamento,
    LocalDateTime dataHora,
    StatusAgendamento status,
    InfoPacienteDTO paciente,
    InfoMedicoDTO medico
) {
    public record InfoPacienteDTO(Long id, String nome) {}
    public record InfoMedicoDTO(Long id, String nome, String especialidade) {}

    public AgendamentoResponseDTO(Agendamento agendamento) {
        this(
            agendamento.getId(),
            agendamento.getDataHora(),
            agendamento.getStatus(),
            new InfoPacienteDTO(
                agendamento.getPaciente().getIdUsuario(),
                agendamento.getPaciente().getUsuario().getNome()
            ),
            new InfoMedicoDTO(
                agendamento.getMedico().getIdUsuario(),
                agendamento.getMedico().getUsuario().getNome(),
                agendamento.getMedico().getEspecialidade()
            )
        );
    }
}