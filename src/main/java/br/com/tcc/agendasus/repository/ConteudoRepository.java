package br.com.tcc.agendasus.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import br.com.tcc.agendasus.model.entity.Conteudo;
import br.com.tcc.agendasus.model.enums.StatusConteudo;

@Repository
public interface ConteudoRepository extends JpaRepository<Conteudo, Long> {

    @Query("SELECT c FROM Conteudo c JOIN FETCH c.autor WHERE c.status = :status ORDER BY c.publicadoEm DESC")
    List<Conteudo> findAllByStatusOrderByPublicadoEmDesc(StatusConteudo status);

    Optional<Conteudo> findByIdAndStatus(Long id, StatusConteudo status);
    
    // [CORREÇÃO] Adiciona JOIN FETCH para carregar o autor e evitar LazyInitializationException
    @Query("SELECT c FROM Conteudo c JOIN FETCH c.autor WHERE c.id = :id")
    Optional<Conteudo> findByIdWithAutor(Long id);

    // Encontra todos os conteúdos de um autor específico
    List<Conteudo> findAllByAutorIdOrderByCriadoEmDesc(Long autorId);
}

