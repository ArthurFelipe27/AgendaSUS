package br.com.tcc.agendasus.dto;

import br.com.tcc.agendasus.model.entity.Medico;
// import br.com.tcc.agendasus.model.entity.UnidadeDeSaude; // Este import não é necessário aqui

public record MedicoResponseDTO(
    Long id,
    String nome,
    String email,
    String cpf,
    String crm,
    String especialidade,
    boolean ativo,
    UnidadeInfoDTO unidade // CAMPO ADICIONADO
) {
    // DTO aninhado para informações da unidade
    public record UnidadeInfoDTO(Long id, String nome) {}

    public MedicoResponseDTO(Medico medico) {
        this(
            medico.getIdUsuario(),
            medico.getUsuario().getNome(),
            medico.getUsuario().getEmail(),
            medico.getUsuario().getCpf(),
            medico.getUsuario().getCrm(),
            medico.getEspecialidade(),
            medico.getUsuario().isAtivo(),
            // Lógica para preencher os dados da unidade (se existir)
            medico.getUnidade() != null ? 
                new UnidadeInfoDTO(medico.getUnidade().getId(), medico.getUnidade().getNome()) : 
                null
        );
    }
}