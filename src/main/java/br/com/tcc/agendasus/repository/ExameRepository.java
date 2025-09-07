package br.com.tcc.agendasus.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.tcc.agendasus.model.entity.Exame;

@Repository
public interface ExameRepository extends JpaRepository<Exame, Long> {
    List<Exame> findAllByPacienteIdUsuario(Long pacienteId);
    List<Exame> findAllByMedicoIdUsuario(Long medicoId);
}