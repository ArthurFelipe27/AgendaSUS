package br.com.tcc.agendasus.dto;

import br.com.tcc.agendasus.model.entity.UnidadeDeSaude;

public record UnidadeSaudeResponseDTO(
    Long id,
    String nome,
    String endereco,
    String cidade,
    String uf,
    String cep,
    String telefone
) {
    public UnidadeSaudeResponseDTO(UnidadeDeSaude unidade) {
        this(unidade.getId(), unidade.getNome(), unidade.getEndereco(), unidade.getCidade(), 
             unidade.getUf(), unidade.getCep(), unidade.getTelefone());
    }
}