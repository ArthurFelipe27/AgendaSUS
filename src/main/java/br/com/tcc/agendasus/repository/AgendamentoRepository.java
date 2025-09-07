package br.com.tcc.agendasus.repository;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.tcc.agendasus.model.entity.Agendamento;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    boolean existsByMedicoIdUsuarioAndDataHora(Long idMedico, LocalDateTime dataHora);
    List<Agendamento> findAllByPacienteIdUsuario(Long pacienteId);
    List<Agendamento> findAllByMedicoIdUsuario(Long medicoId);
}