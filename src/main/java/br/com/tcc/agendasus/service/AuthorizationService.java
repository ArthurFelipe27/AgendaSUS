package br.com.tcc.agendasus.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import br.com.tcc.agendasus.model.entity.Agendamento;
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.Role;

@Service
public class AuthorizationService {

    public Usuario getUsuarioLogado(Authentication authentication) {
        return (Usuario) authentication.getPrincipal();
    }

    public void verificarSePodeAcessarAgendamento(Authentication authentication, Agendamento agendamento) {
        Usuario usuarioLogado = getUsuarioLogado(authentication);

        boolean isPacienteDoAgendamento = usuarioLogado.getId().equals(agendamento.getPaciente().getIdUsuario());
        boolean isMedicoDoAgendamento = usuarioLogado.getId().equals(agendamento.getMedico().getIdUsuario());
        boolean isDiretor = usuarioLogado.getRole() == Role.DIRETOR;

        if (!isPacienteDoAgendamento && !isMedicoDoAgendamento && !isDiretor) {
            throw new AccessDeniedException("Você não tem permissão para acessar os dados deste agendamento.");
        }
    }
    
    public void verificarSePodeAlterarRecurso(Authentication authentication, Long idDoRecurso) {
        Usuario usuarioLogado = getUsuarioLogado(authentication);
        if (usuarioLogado.getRole() != Role.DIRETOR && !usuarioLogado.getId().equals(idDoRecurso)) {
            throw new AccessDeniedException("Você não tem permissão para modificar este recurso.");
        }
    }
}
