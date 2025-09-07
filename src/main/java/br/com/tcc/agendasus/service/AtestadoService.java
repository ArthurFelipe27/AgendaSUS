package br.com.tcc.agendasus.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.tcc.agendasus.dto.AtestadoCadastroDTO;
import br.com.tcc.agendasus.dto.AtestadoResponseDTO;
import br.com.tcc.agendasus.model.entity.Atestado;
import br.com.tcc.agendasus.model.entity.Medico;
import br.com.tcc.agendasus.model.entity.Paciente;
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.Role;
import br.com.tcc.agendasus.repository.AtestadoRepository;
import br.com.tcc.agendasus.repository.MedicoRepository;
import br.com.tcc.agendasus.repository.PacienteRepository;

@Service
public class AtestadoService {

    private final AtestadoRepository repository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;

    public AtestadoService(AtestadoRepository repository, PacienteRepository pacienteRepository, MedicoRepository medicoRepository) {
        this.repository = repository;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
    }

    @Transactional
    public AtestadoResponseDTO criar(AtestadoCadastroDTO dados, Authentication auth) {
        Usuario usuarioLogado = (Usuario) auth.getPrincipal();
        Medico medico = medicoRepository.findById(usuarioLogado.getId())
                .orElseThrow(() -> new RuntimeException("Médico não encontrado"));
        Paciente paciente = pacienteRepository.findById(dados.idPaciente())
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));

        Atestado atestado = new Atestado();
        atestado.setMedico(medico);
        atestado.setPaciente(paciente);
        atestado.setDescricao(dados.descricao());
        atestado.setDataEmissao(LocalDate.now());

        Atestado atestadoSalvo = repository.save(atestado);
        return new AtestadoResponseDTO(atestadoSalvo);
    }

    @Transactional(readOnly = true)
    public List<AtestadoResponseDTO> listarMinhas(Authentication auth) {
        Usuario usuarioLogado = (Usuario) auth.getPrincipal();
        List<Atestado> lista;

        if (usuarioLogado.getRole() == Role.PACIENTE) {
            lista = repository.findAllByPacienteIdUsuario(usuarioLogado.getId());
        } else if (usuarioLogado.getRole() == Role.MEDICO) {
            lista = repository.findAllByMedicoIdUsuario(usuarioLogado.getId());
        } else {
            return List.of();
        }
        return lista.stream().map(AtestadoResponseDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AtestadoResponseDTO> listarTodas() {
        return repository.findAll().stream().map(AtestadoResponseDTO::new).collect(Collectors.toList());
    }
}