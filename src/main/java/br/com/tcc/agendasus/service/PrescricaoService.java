package br.com.tcc.agendasus.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.tcc.agendasus.dto.DTOs.PrescricaoResponseDTO;
import br.com.tcc.agendasus.model.entity.Prescricao;
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.Role;
import br.com.tcc.agendasus.repository.PrescricaoRepository;

@Service
public class PrescricaoService {

    private final PrescricaoRepository repository;
    private final AuthorizationService authorizationService;

    public PrescricaoService(PrescricaoRepository repository, AuthorizationService authorizationService) {
        this.repository = repository;
        this.authorizationService = authorizationService;
    }

    @Transactional(readOnly = true)
    public List<PrescricaoResponseDTO> listarMinhas(Authentication auth) {
        Usuario usuarioLogado = authorizationService.getUsuarioLogado(auth);
        List<Prescricao> lista;

        if (usuarioLogado.getRole() == Role.PACIENTE) {
            lista = repository.findAllByPacienteIdUsuario(usuarioLogado.getId());
        } else if (usuarioLogado.getRole() == Role.MEDICO) {
            lista = repository.findAllByMedicoIdUsuario(usuarioLogado.getId());
        } else {
            return List.of();
        }
        return lista.stream().map(PrescricaoResponseDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PrescricaoResponseDTO buscarPorAgendamento(Long agendamentoId, Authentication auth) {
        return repository.findByAgendamentoId(agendamentoId)
                .map(PrescricaoResponseDTO::new)
                .orElse(null);
    }
}
