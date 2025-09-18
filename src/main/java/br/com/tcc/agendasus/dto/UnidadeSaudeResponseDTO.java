package br.com.tcc.agendasus.dto;

import br.com.tcc.agendasus.model.entity.UnidadeDeSaude;

public record UnidadeSaudeResponseDTO(
    Long id,
    String nome,
    String endereco,
    String regiaoAdministrativa, // <-- CAMPO CORRIGIDO
    String cep,
    String telefone
) {
    public UnidadeSaudeResponseDTO(UnidadeDeSaude unidade) {
        this(
            unidade.getId(), 
            unidade.getNome(), 
            unidade.getEndereco(), 
            unidade.getRegiaoAdministrativa(), // <-- MÉTODO CORRIGIDO
            unidade.getCep(), 
            unidade.getTelefone()
        );
    }
}