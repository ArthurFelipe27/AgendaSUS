package br.com.tcc.agendasus.service;

import org.springframework.stereotype.Service;

import br.com.tcc.agendasus.repository.PacienteRepository;

@Service
public class PacienteService {

    private final PacienteRepository pacienteRepository;

    public PacienteService(PacienteRepository pacienteRepository) {
        this.pacienteRepository = pacienteRepository;
    }

    // Esta classe está intencionalmente enxuta, pois a lógica de prontuário
    // foi movida para AgendamentoService e a de cadastro para UsuarioService.
}