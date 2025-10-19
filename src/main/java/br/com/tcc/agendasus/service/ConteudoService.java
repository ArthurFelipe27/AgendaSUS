package br.com.tcc.agendasus.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.tcc.agendasus.dto.DTOs.*;
import br.com.tcc.agendasus.dto.DTOs.ConteudoCadastroDTO;
import br.com.tcc.agendasus.dto.DTOs.ConteudoResponseDTO;
import br.com.tcc.agendasus.dto.DTOs.ConteudoUpdateDTO;
import br.com.tcc.agendasus.model.entity.Conteudo;
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.Role;
import br.com.tcc.agendasus.model.enums.StatusConteudo;
import br.com.tcc.agendasus.repository.ConteudoRepository;
import jakarta.persistence.EntityNotFoundException;

@Service
public class ConteudoService {

    private final ConteudoRepository repository;
    private final AuthorizationService authorizationService;

    public ConteudoService(ConteudoRepository repository, AuthorizationService authorizationService) {
        this.repository = repository;
        this.authorizationService = authorizationService;
    }

    @Transactional(readOnly = true)
    public List<ConteudoResponseDTO> listarPublicados() {
        return repository.findAllByStatusOrderByPublicadoEmDesc(StatusConteudo.PUBLICADO).stream()
                .map(ConteudoResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public ConteudoResponseDTO criar(ConteudoCadastroDTO dados, Authentication auth) {
        Usuario autor = authorizationService.getUsuarioLogado(auth);

        Conteudo novoConteudo = new Conteudo();
        novoConteudo.setAutor(autor);
        novoConteudo.setTipo(dados.tipo());
        novoConteudo.setTitulo(dados.titulo());
        novoConteudo.setCorpo(dados.corpo());
        novoConteudo.setStatus(StatusConteudo.RASCUNHO);

        return new ConteudoResponseDTO(repository.save(novoConteudo));
    }

    @Transactional(readOnly = true)
    public List<ConteudoResponseDTO> listarTodosAdmin() {
        // [CORREÇÃO] Garante que o autor seja carregado para evitar erros na DTO
        return repository.findAll().stream().map(c -> {
            // Acessa o autor para forçar o carregamento dentro da transação
            c.getAutor().getNome(); 
            return new ConteudoResponseDTO(c);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConteudoResponseDTO> listarMeusConteudos(Authentication auth) {
        Usuario autor = authorizationService.getUsuarioLogado(auth);
        return repository.findAllByAutorIdOrderByCriadoEmDesc(autor.getId()).stream()
                .map(ConteudoResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public ConteudoResponseDTO buscarPorIdAdmin(Long id, Authentication auth) {
        Conteudo conteudo = findById(id);
        Usuario usuarioLogado = authorizationService.getUsuarioLogado(auth);

        // Permite acesso se o usuário for o autor ou um diretor
        boolean isOwner = conteudo.getAutor().getId().equals(usuarioLogado.getId());
        boolean isDirector = usuarioLogado.getRole() == Role.DIRETOR;
        if (!isOwner && !isDirector) {
             throw new AccessDeniedException("Você não tem permissão para visualizar este conteúdo.");
        }
        
        return new ConteudoResponseDTO(conteudo);
    }

    @Transactional
    public ConteudoResponseDTO atualizar(Long id, ConteudoUpdateDTO dados, Authentication auth) {
        Conteudo conteudo = findById(id);
        Usuario usuarioLogado = authorizationService.getUsuarioLogado(auth);
        boolean isOwner = conteudo.getAutor().getId().equals(usuarioLogado.getId());
        boolean isDirector = usuarioLogado.getRole() == Role.DIRETOR;

        if (!isDirector) { 
            if (!isOwner) { 
                throw new AccessDeniedException("Você не pode editar um conteúdo que não é seu.");
            }
            if (conteudo.getStatus() != StatusConteudo.RASCUNHO) { 
                throw new AccessDeniedException("Você só pode editar conteúdos que estão no status 'Rascunho'.");
            }
            if(dados.status() != null && dados.status() != StatusConteudo.RASCUNHO) { 
                 throw new AccessDeniedException("Você não tem permissão para alterar o status do conteúdo.");
            }
        }

        if (dados.titulo() != null) conteudo.setTitulo(dados.titulo());
        if (dados.corpo() != null) conteudo.setCorpo(dados.corpo());
        if (dados.tipo() != null) conteudo.setTipo(dados.tipo());
        
        if (isDirector && dados.status() != null) {
            if (dados.status() == StatusConteudo.PUBLICADO && conteudo.getStatus() != StatusConteudo.PUBLICADO) {
                conteudo.setPublicadoEm(LocalDateTime.now());
            } else if (dados.status() != StatusConteudo.PUBLICADO) {
                conteudo.setPublicadoEm(null); // Remove data de publicação se não for mais público
            }
            conteudo.setStatus(dados.status());
        }
        
        return new ConteudoResponseDTO(repository.save(conteudo));
    }


    @Transactional
    public void deletar(Long id, Authentication auth) {
        Conteudo conteudo = findById(id);
        Usuario usuarioLogado = authorizationService.getUsuarioLogado(auth);

        boolean isOwner = conteudo.getAutor().getId().equals(usuarioLogado.getId());
        boolean isDirector = usuarioLogado.getRole() == Role.DIRETOR;

        if(!isDirector && !isOwner) {
            throw new AccessDeniedException("Você não tem permissão para deletar este conteúdo.");
        }
        if(!isDirector && conteudo.getStatus() != StatusConteudo.RASCUNHO) {
            throw new AccessDeniedException("Você só pode deletar conteúdos no status 'Rascunho'.");
        }
        
        repository.delete(conteudo);
    }
    
    public Conteudo findById(Long id) {
        // Usa o novo método para garantir que o autor seja carregado
        return repository.findByIdWithAutor(id)
                .orElseThrow(() -> new EntityNotFoundException("Conteúdo não encontrado com o ID: " + id));
    }
}

