package br.com.tcc.agendasus.service;

import org.springframework.stereotype.Service;

import br.com.tcc.agendasus.repository.AgendamentoRepository;
import br.com.tcc.agendasus.repository.ExameRepository;
import br.com.tcc.agendasus.repository.PacienteRepository;

@Service
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final ExameRepository exameRepository;

    public PacienteService(PacienteRepository pacienteRepository, AgendamentoRepository agendamentoRepository, ExameRepository exameRepository) {
        this.pacienteRepository = pacienteRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.exameRepository = exameRepository;
    }

  
}