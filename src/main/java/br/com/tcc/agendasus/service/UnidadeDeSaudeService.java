package br.com.tcc.agendasus.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.tcc.agendasus.dto.DTOs.*;
import br.com.tcc.agendasus.dto.DTOs.UnidadeSaudeCadastroDTO;
import br.com.tcc.agendasus.dto.DTOs.UnidadeSaudeResponseDTO;
import br.com.tcc.agendasus.model.entity.UnidadeDeSaude;
import br.com.tcc.agendasus.repository.UnidadeDeSaudeRepository;
import jakarta.persistence.EntityNotFoundException;

@Service
public class UnidadeDeSaudeService {

    private final UnidadeDeSaudeRepository repository;

    public UnidadeDeSaudeService(UnidadeDeSaudeRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public UnidadeSaudeResponseDTO criar(UnidadeSaudeCadastroDTO dados) {
        UnidadeDeSaude novaUnidade = new UnidadeDeSaude();
        novaUnidade.setNome(dados.nome());
        novaUnidade.setEndereco(dados.endereco());
        novaUnidade.setRegiaoAdministrativa(dados.regiaoAdministrativa());
        novaUnidade.setCep(dados.cep());
        novaUnidade.setTelefone(dados.telefone());

        return new UnidadeSaudeResponseDTO(repository.save(novaUnidade));
    }

    @Transactional(readOnly = true)
    public List<UnidadeSaudeResponseDTO> listarTodas() {
        return repository.findAll().stream()
                .map(UnidadeSaudeResponseDTO::new)
                .collect(Collectors.toList());
    }

    public UnidadeDeSaude findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Unidade de Saúde não encontrada com o ID: " + id));
    }
}
