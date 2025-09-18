package br.com.tcc.agendasus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UnidadeSaudeCadastroDTO(
    @NotBlank String nome,
    @NotBlank String endereco,
    @NotBlank String regiaoAdministrativa, // Apenas RA
    @NotBlank @Pattern(regexp = "\\d{8}", message = "CEP deve ter 8 dígitos") String cep,
    String telefone
) {}