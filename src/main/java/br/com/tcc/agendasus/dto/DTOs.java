package br.com.tcc.agendasus.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.validator.constraints.br.CPF;

import br.com.tcc.agendasus.model.entity.Agendamento;
import br.com.tcc.agendasus.model.entity.Atestado;
import br.com.tcc.agendasus.model.entity.Conteudo;
import br.com.tcc.agendasus.model.entity.Exame;
import br.com.tcc.agendasus.model.entity.FichaMedica;
import br.com.tcc.agendasus.model.entity.Medico;
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
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class DTOs {

    // Auth & User
    public record LoginDTO(@NotBlank @Email String email, @NotBlank String senha) {}
    public record TokenDTO(String token, String role, String nome) {}
    public record ForgotPasswordRequestDTO(@NotBlank @Email String email) {}
    public record ResetPasswordRequestDTO(@NotBlank String token, @NotBlank @Size(min = 6) String novaSenha) {}
    public record UsuarioCadastroDTO(
            @NotBlank String nome, @NotBlank @Email String email, @NotBlank @Size(min = 6) String senha,
            @NotBlank @CPF String cpf, @NotNull LocalDate dataNascimento, @NotBlank String telefone,
            @NotNull Sexo sexo, String nomeSocial, String cep, String cidade, String estado, String numero, String complemento) {}
    public record UsuarioUpdateDTO(String nome, @Size(min = 6) String senha) {}
    public record UsuarioResponseDTO(Long id, String nome, String email, String cpf, Role role, boolean ativo) {
        public UsuarioResponseDTO(Usuario usuario) {
            this(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getCpf(), usuario.getRole(), usuario.isAtivo());
        }
    }

    // Agendamento & Prontuário
    public record AgendamentoCadastroDTO(@NotNull Long idMedico, @NotNull @Future LocalDateTime dataHora, @NotBlank String sintomas,
                                         Integer diasSintomas, String alergias, String cirurgias) {}
    public record AgendamentoStatusUpdateDTO(@NotNull StatusAgendamento novoStatus) {}
    public record FinalizarConsultaDTO(String evolucaoMedica, String prescricao, List<String> exames, Integer diasDeRepouso) {}
    public record AgendamentoResponseDTO(Long id, LocalDateTime dataHora, StatusAgendamento status, InfoPacienteDTO paciente, InfoMedicoDTO medico) {
        public record InfoPacienteDTO(Long id, String nome) {}
        public record InfoMedicoDTO(Long id, String nome, String especialidade) {}
        public AgendamentoResponseDTO(Agendamento agendamento) {
            this(agendamento.getId(), agendamento.getDataHora(), agendamento.getStatus(),
                 new InfoPacienteDTO(agendamento.getPaciente().getIdUsuario(), agendamento.getPaciente().getUsuario().getNome()),
                 new InfoMedicoDTO(agendamento.getMedico().getIdUsuario(), agendamento.getMedico().getUsuario().getNome(), agendamento.getMedico().getEspecialidade()));
        }
    }
    public record ProntuarioDTO(
        Long idPaciente, String nomePaciente, Integer idade, String telefone, long totalConsultasComMedico, LocalDateTime proximaConsulta,
        ConsultaDetalhesDTO detalhesDaConsulta, List<ConsultaAnteriorDTO> historicoConsultas
    ) {
        public record ConsultaDetalhesDTO(LocalDateTime data, String sintomas, String evolucaoMedica, String prescricao, List<String> exames, String alergias, String cirurgias, Integer diasSintomas) {}
        public record ConsultaAnteriorDTO(LocalDateTime data, String sintomas) {}
    }


    // Médico & Horários
    public record MedicoCadastroDTO(@NotBlank String nome, @NotBlank @Email String email, @NotBlank String senha,
                                    @NotBlank @CPF String cpf, @NotBlank String crm, @NotBlank String especialidade, @NotNull Long idUnidade) {}
    public record MedicoUpdateDTO(String nome, String crm, String especialidade, Boolean ativo) {}
    public record HorarioDisponivelDTO(@NotEmpty @Valid List<DiaDeTrabalho> dias) {
        public record DiaDeTrabalho(
                @NotBlank @Pattern(regexp = "SEGUNDA|TERCA|QUARTA|QUINTA|SEXTA|SABADO|DOMINGO") String dia,
                @NotEmpty List<@Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$") String> horarios) {}
    }
    public record MedicoResponseDTO(Long id, String nome, String email, String cpf, String crm, String especialidade, boolean ativo, UnidadeInfoDTO unidade) {
        public record UnidadeInfoDTO(Long id, String nome) {}
        public MedicoResponseDTO(Medico medico) {
            this(medico.getIdUsuario(), medico.getUsuario().getNome(), medico.getUsuario().getEmail(),
                 medico.getUsuario().getCpf(), medico.getUsuario().getCrm(), medico.getEspecialidade(), medico.getUsuario().isAtivo(),
                 medico.getUnidade() != null ? new UnidadeInfoDTO(medico.getUnidade().getId(), medico.getUnidade().getNome()) : null);
        }
    }

    // Pós-Consulta (Atestado, Exame, Prescricao)
    public record AtestadoCadastroDTO(@NotNull Long idPaciente, @NotBlank String descricao) {}
    public record PrescricaoCadastroDTO(@NotNull Long idPaciente, @NotBlank String medicamentos) {}
    public record ExameCadastroDTO(@NotNull Long idPaciente, @NotBlank String tipo, @NotNull LocalDate dataRealizacao) {}
    public record ExameResultadoUpdateDTO(@NotBlank String resultado) {}

    public record PrescricaoResponseDTO(Long id, String medicamentos, LocalDate dataEmissao, AgendamentoResponseDTO.InfoPacienteDTO paciente, AgendamentoResponseDTO.InfoMedicoDTO medico) {
        public PrescricaoResponseDTO(Prescricao p) {
            this(p.getId(), p.getMedicamentos(), p.getDataEmissao(),
                 new AgendamentoResponseDTO.InfoPacienteDTO(p.getPaciente().getIdUsuario(), p.getPaciente().getUsuario().getNome()),
                 new AgendamentoResponseDTO.InfoMedicoDTO(p.getMedico().getIdUsuario(), p.getMedico().getUsuario().getNome(), p.getMedico().getEspecialidade()));
        }
    }
    public record AtestadoResponseDTO(Long id, String descricao, LocalDate dataEmissao, AgendamentoResponseDTO.InfoPacienteDTO paciente, AgendamentoResponseDTO.InfoMedicoDTO medico) {
        public AtestadoResponseDTO(Atestado a) {
            this(a.getId(), a.getDescricao(), a.getDataEmissao(),
                 new AgendamentoResponseDTO.InfoPacienteDTO(a.getPaciente().getIdUsuario(), a.getPaciente().getUsuario().getNome()),
                 new AgendamentoResponseDTO.InfoMedicoDTO(a.getMedico().getIdUsuario(), a.getMedico().getUsuario().getNome(), a.getMedico().getEspecialidade()));
        }
    }
    public record ExameResponseDTO(Long id, String tipo, String resultado, LocalDate dataRealizacao, AgendamentoResponseDTO.InfoPacienteDTO paciente, AgendamentoResponseDTO.InfoMedicoDTO medico) {
        public ExameResponseDTO(Exame e) {
            this(e.getId(), e.getTipo(), e.getResultado(), e.getDataRealizacao(),
                 new AgendamentoResponseDTO.InfoPacienteDTO(e.getPaciente().getIdUsuario(), e.getPaciente().getUsuario().getNome()),
                 new AgendamentoResponseDTO.InfoMedicoDTO(e.getMedico().getIdUsuario(), e.getMedico().getUsuario().getNome(), e.getMedico().getEspecialidade()));
        }
    }

    // Unidade de Saúde
    public record UnidadeSaudeCadastroDTO(@NotBlank String nome, @NotBlank String endereco, @NotBlank String regiaoAdministrativa,
                                          @NotBlank @Pattern(regexp = "\\d{8}") String cep, String telefone) {}
    public record UnidadeSaudeResponseDTO(Long id, String nome, String endereco, String regiaoAdministrativa, String cep, String telefone) {
        public UnidadeSaudeResponseDTO(UnidadeDeSaude unidade) {
            this(unidade.getId(), unidade.getNome(), unidade.getEndereco(), unidade.getRegiaoAdministrativa(), unidade.getCep(), unidade.getTelefone());
        }
    }

    // Conteúdo
    public record ConteudoCadastroDTO(@NotNull TipoConteudo tipo, @NotBlank String titulo, @NotBlank String corpo) {}
    public record ConteudoUpdateDTO(String titulo, String corpo, TipoConteudo tipo, StatusConteudo status) {}
    public record ConteudoResponseDTO(Long id, TipoConteudo tipo, String titulo, String corpo, StatusConteudo status, LocalDateTime publicadoEm, AutorDTO autor) {
        public record AutorDTO(Long id, String nome) {}
        public ConteudoResponseDTO(Conteudo c) {
            this(c.getId(), c.getTipo(), c.getTitulo(), c.getCorpo(), c.getStatus(), c.getPublicadoEm(),
                 new AutorDTO(c.getAutor().getId(), c.getAutor().getNome()));
        }
    }
    
    // Ficha Médica
    public record FichaMedicaResponseDTO(Long id, String sintomas, Integer diasSintomas, String alergias, String cirurgias, AgendamentoResponseDTO.InfoPacienteDTO paciente) {
        public FichaMedicaResponseDTO(FichaMedica ficha) {
            this(ficha.getId(), ficha.getSintomas(), ficha.getDiasSintomas(), ficha.getAlergias(), ficha.getCirurgias(),
                 new AgendamentoResponseDTO.InfoPacienteDTO(ficha.getPaciente().getIdUsuario(), ficha.getPaciente().getUsuario().getNome()));
        }
    }
}

