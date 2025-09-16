package br.com.tcc.agendasus.dto;

import java.time.LocalDate;

import org.hibernate.validator.constraints.br.CPF;

import br.com.tcc.agendasus.model.enums.Sexo;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioCadastroDTO(
    @NotBlank(message = "O nome é obrigatório")
    String nome,

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Formato de e-mail inválido")
    String email,

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
    String senha,

    @NotBlank(message = "O CPF é obrigatório")
    @CPF(message = "Formato de CPF inválido")
    String cpf,

    @NotNull LocalDate dataNascimento,
    @NotBlank String telefone,
    @NotNull Sexo sexo,

    String nomeSocial,
    String cep,
    String cidade,
    String estado,
    String numero,
    String complemento
) {}