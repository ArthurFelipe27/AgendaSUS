package br.com.tcc.agendasus.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.tcc.agendasus.dto.DTOs.AtestadoResponseDTO;
import br.com.tcc.agendasus.model.entity.Atestado;
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.Role;
import br.com.tcc.agendasus.repository.AtestadoRepository;

@Service
public class AtestadoService {

    private final AtestadoRepository repository;
    private final AuthorizationService authorizationService;

    public AtestadoService(AtestadoRepository repository, AuthorizationService authorizationService) {
        this.repository = repository;
        this.authorizationService = authorizationService;
    }

    @Transactional(readOnly = true)
    public List<AtestadoResponseDTO> listarMinhas(Authentication auth) {
        Usuario usuarioLogado = authorizationService.getUsuarioLogado(auth);
        List<Atestado> lista = (usuarioLogado.getRole() == Role.PACIENTE)
                ? repository.findAllByPacienteIdUsuario(usuarioLogado.getId())
                : repository.findAllByMedicoIdUsuario(usuarioLogado.getId());
        
        return lista.stream().map(AtestadoResponseDTO::new).collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public AtestadoResponseDTO buscarPorAgendamento(Long agendamentoId, Authentication auth) {
        return repository.findByAgendamentoId(agendamentoId)
                .map(AtestadoResponseDTO::new)
                .orElse(null);
    }
}
