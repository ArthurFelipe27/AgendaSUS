package br.com.tcc.agendasus.dto;

import br.com.tcc.agendasus.dto.MedicoCadastroDTO;
import br.com.tcc.agendasus.model.entity.Medico;
import br.com.tcc.agendasus.model.entity.Usuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.br.CPF;

public record MedicoCadastroDTO(
    @NotBlank String nome,
    @NotBlank @Email String email,
    @NotBlank String senha,
    @NotBlank @CPF String cpf,
    @NotBlank String crm,
    @NotBlank String especialidade
) {}