package br.com.tcc.agendasus.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.tcc.agendasus.dto.UnidadeSaudeCadastroDTO;
import br.com.tcc.agendasus.dto.UnidadeSaudeResponseDTO;
import br.com.tcc.agendasus.model.entity.UnidadeDeSaude;
import br.com.tcc.agendasus.repository.UnidadeDeSaudeRepository;

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
    novaUnidade.setRegiaoAdministrativa(dados.regiaoAdministrativa()); // Define o campo correto
    novaUnidade.setCep(dados.cep());
    novaUnidade.setTelefone(dados.telefone());

    UnidadeDeSaude unidadeSalva = repository.save(novaUnidade);
    return new UnidadeSaudeResponseDTO(unidadeSalva);
}

    @Transactional(readOnly = true)
    public List<UnidadeSaudeResponseDTO> listarTodas() {
        return repository.findAll()
                .stream()
                .map(UnidadeSaudeResponseDTO::new)
                .collect(Collectors.toList());
    }
}