package br.com.tcc.agendasus.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.tcc.agendasus.model.entity.Exame;
import br.com.tcc.agendasus.model.entity.Prescricao;

@Repository
public interface ExameRepository extends JpaRepository<Exame, Long> {
    List<Exame> findAllByPacienteIdUsuario(Long pacienteId);
    List<Exame> findAllByMedicoIdUsuario(Long medicoId);
    boolean existsByPacienteIdUsuario(Long pacienteId);
    List<Exame> findAllByAgendamentoId(Long agendamentoId);
    Optional<Prescricao> findByAgendamento_Id(Long agendamentoId);
}