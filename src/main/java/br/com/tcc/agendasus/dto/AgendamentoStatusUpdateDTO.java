package br.com.tcc.agendasus.dto;

import br.com.tcc.agendasus.model.enums.StatusAgendamento;
import jakarta.validation.constraints.NotNull;

public record AgendamentoStatusUpdateDTO(
    @NotNull(message = "O novo status é obrigatório")
    StatusAgendamento novoStatus
) {}