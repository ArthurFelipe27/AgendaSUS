package br.com.tcc.agendasus.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.hibernate.validator.constraints.br.CPF;

import br.com.tcc.agendasus.model.entity.Agendamento;
import br.com.tcc.agendasus.model.entity.Atestado;
import br.com.tcc.agendasus.model.entity.Conteudo;
import br.com.tcc.agendasus.model.entity.Diretor;
import br.com.tcc.agendasus.model.entity.Exame;
import br.com.tcc.agendasus.model.entity.FichaMedica;
import br.com.tcc.agendasus.model.entity.Medico;
import br.com.tcc.agendasus.model.entity.Paciente;
import br.com.tcc.agendasus.model.entity.Prescricao;
import br.com.tcc.agendasus.model.entity.UnidadeDeSaude;
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.Role;
import br.com.tcc.agendasus.model.enums.Sexo;
import br.com.tcc.agendasus.model.enums.StatusAgendamento;
import br.com.tcc.agendasus.model.enums.StatusConteudo;
import br.com.tcc.agendasus.model.enums.TipoConteudo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class DTOs {

    // Auth & User
    public record LoginDTO(@NotBlank
            @Email String email, @NotBlank String senha) {

    }

    public record TokenDTO(String token, String role, String nome) {

    }

    public record ForgotPasswordRequestDTO(@NotBlank
            @Email String email) {

    }

    public record ResetPasswordRequestDTO(@NotBlank String token, @NotBlank
            @Size(min = 6) String novaSenha) {

    }

    public record UsuarioCadastroDTO(
            @NotBlank String nome, @NotBlank
            @Email String email, @NotBlank
            @Size(min = 6) String senha,
            @NotBlank
            @CPF String cpf, @NotNull
            @PastOrPresent LocalDate dataNascimento, @NotBlank String telefone,
            @NotNull Sexo sexo, String nomeSocial,
            @Pattern(regexp = "\\d{8}", message = "CEP deve conter 8 dígitos") String cep,
            String cidade, String estado, String numero, String complemento) {

    }

    public record PacienteUpdateDTO(
            @Size(min = 10, max = 20, message = "Telefone inválido") String telefone,
            @Pattern(regexp = "\\d{8}", message = "CEP deve conter 8 dígitos") String cep,
            String cidade,
            String estado,
            String numero,
            String complemento
            ) {

    }

    // DTO para atualizar Nome ou Senha (usado por todos os roles)
    public record UsuarioUpdateDTO(
            @Size(min = 3, message = "Nome deve ter pelo menos 3 caracteres") String nome,
            @Size(min = 6, message = "Senha deve ter pelo menos 6 caracteres") String senha
            ) {

    }

    // UsuarioResponseDTO para incluir dados específicos de cada Role
    public record UsuarioResponseDTO(
            Long id, String nome, String email, String cpf, Role role, boolean ativo,
            // Campos Paciente
            String nomeSocial, LocalDate dataNascimento, String telefone, Sexo sexo,
            String cep, String cidade, String estado, String numero, String complemento,
            // Campos Medico
            String crm, String especialidade,
            // Campos Diretor
            String cargo
            ) {

        // Construtor principal que recebe todos os Optionals
        public UsuarioResponseDTO(Usuario usuario, Optional<Paciente> pacienteOpt, Optional<Medico> medicoOpt, Optional<Diretor> diretorOpt) {
            this(
                    // Dados base do Usuario
                    usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getCpf(), usuario.getRole(), usuario.isAtivo(),
                    // Dados do Paciente (se presente)
                    pacienteOpt.map(Paciente::getNomeSocial).orElse(null),
                    pacienteOpt.map(Paciente::getDataNascimento).orElse(null),
                    pacienteOpt.map(Paciente::getTelefone).orElse(null),
                    pacienteOpt.map(Paciente::getSexo).orElse(null),
                    pacienteOpt.map(Paciente::getCep).orElse(null),
                    pacienteOpt.map(Paciente::getCidade).orElse(null),
                    pacienteOpt.map(Paciente::getEstado).orElse(null),
                    pacienteOpt.map(Paciente::getNumero).orElse(null),
                    pacienteOpt.map(Paciente::getComplemento).orElse(null),
                    // Dados do Medico (usa CRM do Usuario base, pega especialidade do Medico)
                    (usuario.getRole() == Role.MEDICO) ? usuario.getCrm() : null, // CRM está no Usuario
                    medicoOpt.map(Medico::getEspecialidade).orElse(null),
                    // Dados do Diretor (se presente)
                    diretorOpt.map(Diretor::getCargo).orElse(null)
            );
        }

        // Construtor simplificado (para listagem geral, sem detalhes específicos)
        public UsuarioResponseDTO(Usuario usuario) {
            this(usuario, Optional.empty(), Optional.empty(), Optional.empty());
        }
    }

    // Agendamento & Prontuário
    public record AgendamentoCadastroDTO(@NotNull Long idMedico, @NotNull
            @Future LocalDateTime dataHora, @NotBlank String sintomas,
            Integer diasSintomas, String alergias, String cirurgias) {

    }

    public record AgendamentoStatusUpdateDTO(@NotNull StatusAgendamento novoStatus) {

    }

    public record FinalizarConsultaDTO(String evolucaoMedica, String prescricao, List<String> exames, Integer diasDeRepouso) {

    }

    public record AgendamentoResponseDTO(Long id, LocalDateTime dataHora, StatusAgendamento status, InfoPacienteDTO paciente, InfoMedicoDTO medico) {

        public record InfoPacienteDTO(Long id, String nome) {

        }

        public record InfoMedicoDTO(Long id, String nome, String especialidade, String nomeUnidade, String enderecoUnidade) {

        }

        public AgendamentoResponseDTO(Agendamento agendamento) {
            this(agendamento.getId(), agendamento.getDataHora(), agendamento.getStatus(),
                    new InfoPacienteDTO(agendamento.getPaciente().getIdUsuario(), agendamento.getPaciente().getUsuario().getNome()),
                    new InfoMedicoDTO(
                            agendamento.getMedico().getIdUsuario(),
                            agendamento.getMedico().getUsuario().getNome(),
                            agendamento.getMedico().getEspecialidade(),
                            Optional.ofNullable(agendamento.getMedico().getUnidade()).map(UnidadeDeSaude::getNome).orElse("N/A"),
                            Optional.ofNullable(agendamento.getMedico().getUnidade()).map(UnidadeDeSaude::getEndereco).orElse("Endereço não informado")
                    ));
        }
    }

    public record ProntuarioDTO(
            Long idPaciente, String nomePaciente, Integer idade, String telefone, long totalConsultasComMedico, LocalDateTime proximaConsulta,
            ConsultaDetalhesDTO detalhesDaConsulta, List<ConsultaAnteriorDTO> historicoConsultas
            ) {

        public record ConsultaDetalhesDTO(LocalDateTime data, String sintomas, String evolucaoMedica, String prescricao, List<String> exames, String alergias, String cirurgias, Integer diasSintomas) {

        }

        public record ConsultaAnteriorDTO(LocalDateTime data, String sintomas) {

        }
    }

    // Médico & Horários
    public record MedicoCadastroDTO(@NotBlank String nome, @NotBlank
            @Email String email, @NotBlank
            @Size(min = 6) String senha,
            @NotBlank
            @CPF String cpf, @NotBlank String crm, @NotBlank String especialidade, @NotNull Long idUnidade) {

    }

    // Este DTO é para o Admin editar dados do Médico
    public record MedicoUpdateDTO(String nome, String crm, String especialidade, Boolean ativo) {

    }

    public record HorarioDisponivelDTO(@Valid List<DiaDeTrabalho> dias) {

        public record DiaDeTrabalho(
                @NotBlank
                @Pattern(regexp = "SEGUNDA|TERCA|QUARTA|QUINTA|SEXTA|SABADO|DOMINGO", message = "Dia inválido")
                String dia, // Corrigido SATURDAY para SABADO
                @NotEmpty
                List<@Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Formato de hora inválido (HH:mm)") String> horarios) {

        }
    }

    public record MedicoResponseDTO(Long id, String nome, String email, String cpf, String crm, String especialidade, boolean ativo, UnidadeInfoDTO unidade) {

        public record UnidadeInfoDTO(Long id, String nome) {

        }

        public MedicoResponseDTO(Medico medico) {
            this(medico.getIdUsuario(), medico.getUsuario().getNome(), medico.getUsuario().getEmail(),
                    medico.getUsuario().getCpf(), medico.getUsuario().getCrm(), medico.getEspecialidade(), medico.getUsuario().isAtivo(),
                    Optional.ofNullable(medico.getUnidade())
                            .map(u -> new UnidadeInfoDTO(u.getId(), u.getNome()))
                            .orElse(null));
        }
    }

    // Pós-Consulta (Atestado, Exame, Prescricao)
    public record AtestadoCadastroDTO(@NotNull Long idPaciente, @NotBlank String descricao) {

    }

    public record PrescricaoCadastroDTO(@NotNull Long idPaciente, @NotBlank String medicamentos) {

    }

    public record ExameCadastroDTO(@NotNull Long idPaciente, @NotBlank String tipo, @NotNull LocalDate dataRealizacao) {

    }

    public record ExameResultadoUpdateDTO(@NotBlank String resultado) {

    }

    public record PrescricaoResponseDTO(Long id, String medicamentos, LocalDate dataEmissao, AgendamentoResponseDTO.InfoPacienteDTO paciente, AgendamentoResponseDTO.InfoMedicoDTO medico) {

        public PrescricaoResponseDTO(Prescricao p) {
            this(p.getId(), p.getMedicamentos(), p.getDataEmissao(),
                    new AgendamentoResponseDTO.InfoPacienteDTO(p.getPaciente().getIdUsuario(), p.getPaciente().getUsuario().getNome()),
                    new AgendamentoResponseDTO.InfoMedicoDTO(
                            p.getMedico().getIdUsuario(),
                            p.getMedico().getUsuario().getNome(),
                            p.getMedico().getEspecialidade(),
                            Optional.ofNullable(p.getMedico().getUnidade()).map(UnidadeDeSaude::getNome).orElse("N/A"),
                            Optional.ofNullable(p.getMedico().getUnidade()).map(UnidadeDeSaude::getEndereco).orElse(null)
                    ));
        }
    }

    public record AtestadoResponseDTO(Long id, String descricao, LocalDate dataEmissao, AgendamentoResponseDTO.InfoPacienteDTO paciente, AgendamentoResponseDTO.InfoMedicoDTO medico) {

        public AtestadoResponseDTO(Atestado a) {
            this(a.getId(), a.getDescricao(), a.getDataEmissao(),
                    new AgendamentoResponseDTO.InfoPacienteDTO(a.getPaciente().getIdUsuario(), a.getPaciente().getUsuario().getNome()),
                    new AgendamentoResponseDTO.InfoMedicoDTO(
                            a.getMedico().getIdUsuario(),
                            a.getMedico().getUsuario().getNome(),
                            a.getMedico().getEspecialidade(),
                            Optional.ofNullable(a.getMedico().getUnidade()).map(UnidadeDeSaude::getNome).orElse("N/A"),
                            Optional.ofNullable(a.getMedico().getUnidade()).map(UnidadeDeSaude::getEndereco).orElse(null)
                    ));
        }
    }

    public record ExameResponseDTO(Long id, String tipo, String resultado, LocalDate dataRealizacao, AgendamentoResponseDTO.InfoPacienteDTO paciente, AgendamentoResponseDTO.InfoMedicoDTO medico) {

        public ExameResponseDTO(Exame e) {
            this(e.getId(), e.getTipo(), e.getResultado(), e.getDataRealizacao(),
                    new AgendamentoResponseDTO.InfoPacienteDTO(e.getPaciente().getIdUsuario(), e.getPaciente().getUsuario().getNome()),
                    new AgendamentoResponseDTO.InfoMedicoDTO(
                            e.getMedico().getIdUsuario(),
                            e.getMedico().getUsuario().getNome(),
                            e.getMedico().getEspecialidade(),
                            Optional.ofNullable(e.getMedico().getUnidade()).map(UnidadeDeSaude::getNome).orElse("N/A"),
                            Optional.ofNullable(e.getMedico().getUnidade()).map(UnidadeDeSaude::getEndereco).orElse(null)
                    ));
        }
    }

    // Unidade de Saúde
    public record UnidadeSaudeCadastroDTO(@NotBlank String nome, @NotBlank String endereco, @NotBlank String regiaoAdministrativa,
            @NotBlank
            @Pattern(regexp = "\\d{8}") String cep, String telefone) {

    }

    public record UnidadeSaudeResponseDTO(Long id, String nome, String endereco, String regiaoAdministrativa, String cep, String telefone) {

        public UnidadeSaudeResponseDTO(UnidadeDeSaude unidade) {
            this(unidade.getId(), unidade.getNome(), unidade.getEndereco(), unidade.getRegiaoAdministrativa(), unidade.getCep(), unidade.getTelefone());
        }
    }

    // Conteúdo
    public record ConteudoCadastroDTO(@NotNull TipoConteudo tipo, @NotBlank String titulo, @NotBlank String corpo) {

    }

    public record ConteudoUpdateDTO(String titulo, String corpo, TipoConteudo tipo, StatusConteudo status) {

    }

    public record ConteudoResponseDTO(Long id, TipoConteudo tipo, String titulo, String corpo, StatusConteudo status, LocalDateTime publicadoEm, AutorDTO autor) {

        public record AutorDTO(Long id, String nome) {

        }

        public ConteudoResponseDTO(Conteudo c) {
            this(c.getId(), c.getTipo(), c.getTitulo(), c.getCorpo(), c.getStatus(), c.getPublicadoEm(),
                    Optional.ofNullable(c.getAutor())
                            .map(autor -> new AutorDTO(autor.getId(), autor.getNome()))
                            .orElse(new AutorDTO(null, "Autor Desconhecido")));
        }
    }

    // Ficha Médica
    public record FichaMedicaResponseDTO(Long id, String sintomas, Integer diasSintomas, String alergias, String cirurgias, String evolucaoMedica, AgendamentoResponseDTO.InfoPacienteDTO paciente) {

        public FichaMedicaResponseDTO(FichaMedica ficha) {
            this(ficha.getId(), ficha.getSintomas(), ficha.getDiasSintomas(), ficha.getAlergias(), ficha.getCirurgias(), ficha.getEvolucaoMedica(),
                    new AgendamentoResponseDTO.InfoPacienteDTO(ficha.getPaciente().getIdUsuario(), ficha.getPaciente().getUsuario().getNome()));
        }
    }
}
