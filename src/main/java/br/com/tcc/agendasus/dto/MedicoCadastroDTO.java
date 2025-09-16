package br.com.tcc.agendasus.dto;

import org.hibernate.validator.constraints.br.CPF;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MedicoCadastroDTO(
    @NotBlank String nome,
    @NotBlank @Email String email,
    @NotBlank String senha,
    @NotBlank @CPF String cpf,
    @NotBlank String crm,
    @NotBlank String especialidade,
    @NotNull Long idUnidade
) {}