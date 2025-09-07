package br.com.tcc.agendasus.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.tcc.agendasus.dto.ConteudoCadastroDTO;
import br.com.tcc.agendasus.dto.ConteudoResponseDTO;
import br.com.tcc.agendasus.dto.ConteudoUpdateDTO;
import br.com.tcc.agendasus.model.entity.Conteudo;
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.StatusConteudo;
import br.com.tcc.agendasus.repository.ConteudoRepository;

@Service
public class ConteudoService {

    private final ConteudoRepository repository;

    public ConteudoService(ConteudoRepository repository) {
        this.repository = repository;
    }

    // --- Métodos Públicos (sem login) ---

    @Transactional(readOnly = true)
    public List<ConteudoResponseDTO> listarPublicados() {
        return repository.findAllByStatus(StatusConteudo.PUBLICADO)
                .stream()
                .map(ConteudoResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConteudoResponseDTO getPublicadoPorId(Long id) {
        return repository.findByIdAndStatus(id, StatusConteudo.PUBLICADO)
                .map(ConteudoResponseDTO::new)
                .orElseThrow(() -> new RuntimeException("Conteúdo não encontrado ou não está publicado."));
    }

    // --- Métodos de Admin (requer login de Diretor) ---

    @Transactional(readOnly = true)
    public List<ConteudoResponseDTO> listarTodosAdmin() {
        return repository.findAll()
                .stream()
                .map(ConteudoResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public ConteudoResponseDTO criar(ConteudoCadastroDTO dados, Authentication auth) {
        Usuario autor = (Usuario) auth.getPrincipal();

        Conteudo novoConteudo = new Conteudo();
        novoConteudo.setAutor(autor);
        novoConteudo.setTipo(dados.tipo());
        novoConteudo.setTitulo(dados.titulo());
        novoConteudo.setCorpo(dados.corpo());
        novoConteudo.setStatus(StatusConteudo.RASCUNHO); 

        Conteudo conteudoSalvo = repository.save(novoConteudo);
        return new ConteudoResponseDTO(conteudoSalvo);
    }

    @Transactional
    public ConteudoResponseDTO atualizar(Long id, ConteudoUpdateDTO dados) {
        Conteudo conteudo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conteúdo não encontrado."));

        if (dados.titulo() != null) conteudo.setTitulo(dados.titulo());
        if (dados.corpo() != null) conteudo.setCorpo(dados.corpo());
        if (dados.tipo() != null) conteudo.setTipo(dados.tipo());
        if (dados.status() != null) {
            if (dados.status() == StatusConteudo.PUBLICADO && conteudo.getStatus() != StatusConteudo.PUBLICADO) {
                conteudo.setPublicadoEm(LocalDateTime.now());
            }
            conteudo.setStatus(dados.status());
        }

        Conteudo conteudoSalvo = repository.save(conteudo);
        return new ConteudoResponseDTO(conteudoSalvo);
    }

    @Transactional
    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Conteúdo não encontrado.");
        }
        repository.deleteById(id);
    }
}