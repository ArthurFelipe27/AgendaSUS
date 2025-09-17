package br.com.tcc.agendasus.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.tcc.agendasus.model.entity.Prescricao;

@Repository
public interface PrescricaoRepository extends JpaRepository<Prescricao, Long> {
    List<Prescricao> findAllByPacienteIdUsuario(Long pacienteId);
    List<Prescricao> findAllByMedicoIdUsuario(Long medicoId);
    Optional<Prescricao> findByAgendamento_Id(Long agendamentoId);
}