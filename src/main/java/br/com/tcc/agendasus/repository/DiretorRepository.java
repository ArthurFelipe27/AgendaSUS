package br.com.tcc.agendasus.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.tcc.agendasus.model.entity.Diretor;

@Repository
public interface DiretorRepository extends JpaRepository<Diretor, Long> {}