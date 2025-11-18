package br.com.tcc.agendasus.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.tcc.agendasus.dto.DTOs.ExameResponseDTO;
import br.com.tcc.agendasus.dto.DTOs.ExameResultadoUpdateDTO;
import br.com.tcc.agendasus.model.entity.Exame;
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.Role;
import br.com.tcc.agendasus.repository.ExameRepository;
import jakarta.persistence.EntityNotFoundException;

@Service
public class ExameService {

    private final ExameRepository repository;
    private final AuthorizationService authorizationService;


    public ExameService(ExameRepository repository, AuthorizationService authorizationService) {
        this.repository = repository;
        this.authorizationService = authorizationService;
    }

    @Transactional(readOnly = true)
    public List<ExameResponseDTO> listarMinhas(Authentication auth) {
        Usuario usuarioLogado = authorizationService.getUsuarioLogado(auth);
        List<Exame> lista;
        if (usuarioLogado.getRole() == Role.PACIENTE) {
            lista = repository.findAllByPacienteIdUsuario(usuarioLogado.getId());
        } else if (usuarioLogado.getRole() == Role.MEDICO) {
            lista = repository.findAllByMedicoIdUsuario(usuarioLogado.getId());
        } else {
            return List.of();
        }
        return lista.stream().map(ExameResponseDTO::new).collect(Collectors.toList());
    }

    @Transactional
    public ExameResponseDTO atualizarResultado(Long exameId, ExameResultadoUpdateDTO dados, Authentication auth) {
        Usuario usuarioLogado = authorizationService.getUsuarioLogado(auth);
        Exame exame = repository.findById(exameId)
                .orElseThrow(() -> new EntityNotFoundException("Exame não encontrado."));
        if (!exame.getMedico().getIdUsuario().equals(usuarioLogado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para atualizar o resultado deste exame.");
        }
        exame.setResultado(dados.resultado());
        return new ExameResponseDTO(repository.save(exame));
    }

    @Transactional(readOnly = true)
    public List<ExameResponseDTO> buscarPorAgendamento(Long agendamentoId, Authentication auth) {
        return repository.findAllByAgendamentoId(agendamentoId)
                .stream()
                .map(ExameResponseDTO::new)
                .collect(Collectors.toList());
    }
}
