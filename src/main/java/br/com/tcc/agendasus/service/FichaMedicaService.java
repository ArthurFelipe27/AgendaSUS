package br.com.tcc.agendasus.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.tcc.agendasus.dto.FichaMedicaResponseDTO;
import br.com.tcc.agendasus.model.entity.Agendamento;
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.Role;
import br.com.tcc.agendasus.repository.AgendamentoRepository;

@Service
public class FichaMedicaService {

    private final AgendamentoRepository agendamentoRepository;

    public FichaMedicaService(AgendamentoRepository agendamentoRepository) {
        this.agendamentoRepository = agendamentoRepository;
    }

    @Transactional(readOnly = true)
    public FichaMedicaResponseDTO getFichaPorAgendamentoId(Long agendamentoId, Authentication authentication) {
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();

        // 1. Busca o agendamento pelo ID
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado."));

        // 2. REGRA DE SEGURANÇA: O usuário logado é o médico deste agendamento OU um diretor?
        boolean isMedicoDoAgendamento = usuarioLogado.getRole() == Role.MEDICO && agendamento.getMedico().getIdUsuario().equals(usuarioLogado.getId());
        boolean isDiretor = usuarioLogado.getRole() == Role.DIRETOR;

        if (!isMedicoDoAgendamento && !isDiretor) {
            throw new AccessDeniedException("Você não tem permissão para visualizar esta ficha médica.");
        }

        // 3. Se a permissão for válida, retorna o DTO da ficha médica
        return new FichaMedicaResponseDTO(agendamento.getFichaMedica());
    }
}