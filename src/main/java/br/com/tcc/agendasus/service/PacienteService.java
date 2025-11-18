package br.com.tcc.agendasus.service;

import org.springframework.stereotype.Service;

import br.com.tcc.agendasus.repository.PacienteRepository;

@Service
public class PacienteService {

    private final PacienteRepository pacienteRepository;

    public PacienteService(PacienteRepository pacienteRepository) {
        this.pacienteRepository = pacienteRepository;
    }

   
}