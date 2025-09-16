package br.com.tcc.agendasus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UnidadeSaudeCadastroDTO(
    @NotBlank String nome,
    @NotBlank String endereco,
    @NotBlank String cidade,
    @NotBlank @Pattern(regexp = "[A-Z]{2}", message = "UF deve ter 2 letras maiúsculas") String uf,
    @NotBlank @Pattern(regexp = "\\d{8}", message = "CEP deve ter 8 dígitos, apenas números") String cep,
    String telefone
) {}