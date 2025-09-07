package br.com.tcc.agendasus.dto;

import br.com.tcc.agendasus.model.entity.Medico;

public record MedicoResponseDTO(
    Long id,
    String nome,
    String email,
    String cpf,
    String crm,
    String especialidade,
    boolean ativo
) {
    public MedicoResponseDTO(Medico medico) {
        this(
            medico.getIdUsuario(),
            medico.getUsuario().getNome(),
            medico.getUsuario().getEmail(),
            medico.getUsuario().getCpf(),
            medico.getUsuario().getCrm(),
            medico.getEspecialidade(),
            medico.getUsuario().isAtivo()
        );
    }
}