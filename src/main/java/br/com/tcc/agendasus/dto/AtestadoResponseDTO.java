package br.com.tcc.agendasus.dto;

import java.time.LocalDate;

import br.com.tcc.agendasus.model.entity.Atestado;

public record AtestadoResponseDTO(
    Long id,
    LocalDate dataEmissao,
    String descricao,
    AgendamentoResponseDTO.InfoPacienteDTO paciente,
    AgendamentoResponseDTO.InfoMedicoDTO medico
) {
    public AtestadoResponseDTO(Atestado a) {
        this(
            a.getId(),
            a.getDataEmissao(),
            a.getDescricao(),
            new AgendamentoResponseDTO.InfoPacienteDTO(a.getPaciente().getIdUsuario(), a.getPaciente().getUsuario().getNome()),
            new AgendamentoResponseDTO.InfoMedicoDTO(a.getMedico().getIdUsuario(), a.getMedico().getUsuario().getNome(), a.getMedico().getEspecialidade())
        );
    }
}