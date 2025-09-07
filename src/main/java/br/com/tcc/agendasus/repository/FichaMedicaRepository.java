package br.com.tcc.agendasus.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.tcc.agendasus.model.entity.FichaMedica;

@Repository
public interface FichaMedicaRepository extends JpaRepository<FichaMedica, Long> {}