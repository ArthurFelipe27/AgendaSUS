package br.com.tcc.agendasus.service;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.tcc.agendasus.dto.DTOs.*;
import br.com.tcc.agendasus.dto.DTOs.FichaMedicaResponseDTO;
import br.com.tcc.agendasus.model.entity.Agendamento;
import br.com.tcc.agendasus.repository.AgendamentoRepository;
import jakarta.persistence.EntityNotFoundException;

@Service
public class FichaMedicaService {

    private final AgendamentoRepository agendamentoRepository;
    private final AuthorizationService authorizationService;

    public FichaMedicaService(AgendamentoRepository agendamentoRepository, AuthorizationService authorizationService) {
        this.agendamentoRepository = agendamentoRepository;
        this.authorizationService = authorizationService;
    }

    @Transactional(readOnly = true)
    public FichaMedicaResponseDTO getFichaPorAgendamentoId(Long agendamentoId, Authentication authentication) {
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new EntityNotFoundException("Agendamento não encontrado."));

        authorizationService.verificarSePodeAcessarAgendamento(authentication, agendamento);

        return new FichaMedicaResponseDTO(agendamento.getFichaMedica());
    }
}
