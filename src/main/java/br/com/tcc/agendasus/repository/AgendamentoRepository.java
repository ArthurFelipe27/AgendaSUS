package br.com.tcc.agendasus.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.tcc.agendasus.model.entity.Agendamento;
import br.com.tcc.agendasus.model.enums.StatusAgendamento;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    boolean existsByMedicoIdUsuarioAndDataHora(Long idMedico, LocalDateTime dataHora);
    List<Agendamento> findAllByMedicoIdUsuario(Long medicoId);
    List<Agendamento> findByMedicoIdUsuarioAndStatusInAndDataHoraAfter(Long medicoId, Collection<StatusAgendamento> statuses, LocalDateTime dataHora);
    
    // CORREÇÃO: Método adicionado para verificar múltiplos status de uma vez.
    long countByPacienteIdUsuarioAndMedicoIdUsuarioAndStatusIn(Long pacienteId, Long medicoId, Collection<StatusAgendamento> statuses);

    List<Agendamento> findAllByPacienteIdUsuario(Long pacienteId);
    long countByPacienteIdUsuarioAndMedicoIdUsuarioAndStatus(Long pacienteId, Long medicoId, StatusAgendamento status);
    Optional<Agendamento> findFirstByPacienteIdUsuarioAndMedicoIdUsuarioAndDataHoraAfterOrderByDataHoraAsc(Long pacienteId, Long medicoId, LocalDateTime agora);
    List<Agendamento> findAllByPacienteIdUsuarioAndMedicoIdUsuarioAndStatus(Long pacienteId, Long medicoId, StatusAgendamento status);
}

