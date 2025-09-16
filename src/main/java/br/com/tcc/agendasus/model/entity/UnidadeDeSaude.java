package br.com.tcc.agendasus.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "unidade_saude")
public class UnidadeDeSaude {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String endereco;
    
    @Column(nullable = false)
    private String cidade;

    @Column(nullable = false, length = 2)
    private String uf;
    
    @Column(nullable = false, length = 10)
    private String cep;
    
    private String telefone;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    @PrePersist
    protected void onCreate() { criadoEm = LocalDateTime.now(); atualizadoEm = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { atualizadoEm = LocalDateTime.now(); }
}