package br.com.tcc.agendasus.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.tcc.agendasus.dto.PrescricaoCadastroDTO;
import br.com.tcc.agendasus.dto.PrescricaoResponseDTO;
import br.com.tcc.agendasus.model.entity.Medico;
import br.com.tcc.agendasus.model.entity.Paciente;
import br.com.tcc.agendasus.model.entity.Prescricao;
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.model.enums.Role;
import br.com.tcc.agendasus.repository.MedicoRepository;
import br.com.tcc.agendasus.repository.PacienteRepository;
import br.com.tcc.agendasus.repository.PrescricaoRepository;

@Service
public class PrescricaoService {

    private final PrescricaoRepository repository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;

    public PrescricaoService(PrescricaoRepository repository, PacienteRepository pacienteRepository, MedicoRepository medicoRepository) {
        this.repository = repository;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
    }

    @Transactional
    public PrescricaoResponseDTO criar(PrescricaoCadastroDTO dados, Authentication auth) {
        Usuario usuarioLogado = (Usuario) auth.getPrincipal();
        Medico medico = medicoRepository.findById(usuarioLogado.getId())
                .orElseThrow(() -> new RuntimeException("Médico não encontrado"));
        Paciente paciente = pacienteRepository.findById(dados.idPaciente())
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));

        Prescricao prescricao = new Prescricao();
        prescricao.setMedico(medico);
        prescricao.setPaciente(paciente);
        prescricao.setMedicamentos(dados.medicamentos());
        prescricao.setDataEmissao(LocalDate.now());

        Prescricao prescricaoSalva = repository.save(prescricao);
        return new PrescricaoResponseDTO(prescricaoSalva);
    }

    @Transactional(readOnly = true)
    public List<PrescricaoResponseDTO> listarMinhas(Authentication auth) {
        Usuario usuarioLogado = (Usuario) auth.getPrincipal();
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
    public List<PrescricaoResponseDTO> listarTodas() {
        return repository.findAll().stream().map(PrescricaoResponseDTO::new).collect(Collectors.toList());
    }
}