package br.com.tcc.agendasus.dto;

import java.time.LocalDate;

import br.com.tcc.agendasus.model.entity.Prescricao;

public record PrescricaoResponseDTO(
    Long id,
    LocalDate dataEmissao,
    String medicamentos,
    AgendamentoResponseDTO.InfoPacienteDTO paciente,
    AgendamentoResponseDTO.InfoMedicoDTO medico
) {
    public PrescricaoResponseDTO(Prescricao p) {
        this(
            p.getId(),
            p.getDataEmissao(),
            p.getMedicamentos(),
            new AgendamentoResponseDTO.InfoPacienteDTO(p.getPaciente().getIdUsuario(), p.getPaciente().getUsuario().getNome()),
            new AgendamentoResponseDTO.InfoMedicoDTO(p.getMedico().getIdUsuario(), p.getMedico().getUsuario().getNome(), p.getMedico().getEspecialidade())
        );
    }
}