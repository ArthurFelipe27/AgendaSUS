package br.com.tcc.agendasus.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.tcc.agendasus.dto.DTOs.*;
import br.com.tcc.agendasus.dto.DTOs.ConteudoCadastroDTO;
import br.com.tcc.agendasus.dto.DTOs.ConteudoResponseDTO;
import br.com.tcc.agendasus.dto.DTOs.ConteudoUpdateDTO;
import br.com.tcc.agendasus.model.entity.Conteudo;
import br.com.tcc.agendasus.model.entity.Usuario;
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
        return repository.findAll().stream().map(ConteudoResponseDTO::new).collect(Collectors.toList());
    }

    @Transactional
    public ConteudoResponseDTO atualizar(Long id, ConteudoUpdateDTO dados) {
        Conteudo conteudo = findById(id);

        if (dados.titulo() != null) conteudo.setTitulo(dados.titulo());
        if (dados.corpo() != null) conteudo.setCorpo(dados.corpo());
        if (dados.tipo() != null) conteudo.setTipo(dados.tipo());
        if (dados.status() != null) {
            if (dados.status() == StatusConteudo.PUBLICADO && conteudo.getStatus() != StatusConteudo.PUBLICADO) {
                conteudo.setPublicadoEm(LocalDateTime.now());
            }
            conteudo.setStatus(dados.status());
        }
        
        return new ConteudoResponseDTO(repository.save(conteudo));
    }

    @Transactional
    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Conteúdo não encontrado com o ID: " + id);
        }
        repository.deleteById(id);
    }
    
    public Conteudo findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Conteúdo não encontrado com o ID: " + id));
    }
}
