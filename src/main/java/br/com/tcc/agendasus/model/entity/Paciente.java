package br.com.tcc.agendasus.model.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import br.com.tcc.agendasus.model.enums.Sexo;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(of = "idUsuario")
@Entity
@Table(name = "paciente")
public class Paciente {

    @Id
    @Column(name = "id_usuario")
    private Long idUsuario;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId 
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Column(length = 30)
    private String telefone;

    private String endereco;

    @Enumerated(EnumType.STRING)
    private Sexo sexo;
    
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
        atualizadoEm = LocalDateTime.now();
    }
    @PreUpdate
    protected void onUpdate() {
        atualizadoEm = LocalDateTime.now();
    }

    @Column(name = "nome_social")
    private String nomeSocial;

    private String cep;
    private String cidade;
    private String estado;
    private String numero;
    private String complemento;
}