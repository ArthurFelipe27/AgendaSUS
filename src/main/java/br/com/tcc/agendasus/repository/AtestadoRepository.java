package br.com.tcc.agendasus.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.tcc.agendasus.model.entity.Atestado;

@Repository
public interface AtestadoRepository extends JpaRepository<Atestado, Long> {
    List<Atestado> findAllByPacienteIdUsuario(Long pacienteId);
    List<Atestado> findAllByMedicoIdUsuario(Long medicoId);
    Optional<Atestado> findByAgendamento_Id(Long agendamentoId);
}