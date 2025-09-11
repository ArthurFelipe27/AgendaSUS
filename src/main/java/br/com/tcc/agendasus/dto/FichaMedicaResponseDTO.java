package br.com.tcc.agendasus.dto;

import br.com.tcc.agendasus.model.entity.FichaMedica;

// DTO para a RESPOSTA (não precisamos de um de cadastro, pois ela é criada com o agendamento)
public record FichaMedicaResponseDTO(
    Long id,
    String sintomas,
    Integer diasSintomas,
    String alergias,
    String cirurgias,
    AgendamentoResponseDTO.InfoPacienteDTO paciente
) {
    public FichaMedicaResponseDTO(FichaMedica ficha) {
        this(
            ficha.getId(),
            ficha.getSintomas(),
            ficha.getDiasSintomas(),
            ficha.getAlergias(),
            ficha.getCirurgias(),
            new AgendamentoResponseDTO.InfoPacienteDTO(
                ficha.getPaciente().getIdUsuario(),
                ficha.getPaciente().getUsuario().getNome()
            )
        );
    }
}