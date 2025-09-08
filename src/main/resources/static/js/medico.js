document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    let meuIdDeMedico = null; // Vamos precisar do ID do médico

    // Dias da semana na ordem correta
    const DIAS_DA_SEMANA = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO"];

    // Inicializa o dashboard do médico
    async function initMedicoDashboard() {
        // Busca o perfil do usuário logado para pegar o ID (necessário para ler os próprios horários)
        try {
            const respMe = await fetchAuthenticated('/api/usuarios/me');
            const usuario = await respMe.json();
            meuIdDeMedico = usuario.id; // Salva o ID globalmente para este script
        } catch (e) {
            console.error("Erro fatal ao buscar perfil do médico.", e);
            contentArea.innerHTML = "<p>Erro ao carregar dados. Faça login novamente.</p>";
            return;
        }

        contentArea.innerHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card" id="card-minha-agenda">Ver Minha Agenda</div>
                <div class="dashboard-card" id="card-meus-horarios">Gerenciar Meus Horários</div>
            </div>
            <hr>
            <div id="medico-content-dinamico"></div>
        `;

        document.getElementById('card-minha-agenda').addEventListener('click', renderMinhaAgenda);
        document.getElementById('card-meus-horarios').addEventListener('click', renderGerenciarHorarios);

        // Carrega a agenda por padrão
        await renderMinhaAgenda();
    }

    /**
     * Renderiza a lista de agendamentos do médico (Lógica anterior, sem alteração)
     */
    async function renderMinhaAgenda() {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<h3>Meus Agendamentos</h3><ul id="lista-agendamentos-medico" class="medico-list"><li>Carregando...</li></ul>`;

        try {
            const response = await fetchAuthenticated('/api/agendamentos/meus');
            if (!response.ok) throw new Error("Erro ao buscar agendamentos.");

            const agendamentos = await response.json();
            const listaUL = document.getElementById('lista-agendamentos-medico');
            listaUL.innerHTML = '';

            if (agendamentos.length === 0) {
                listaUL.innerHTML = '<li>Você não possui agendamentos.</li>';
                return;
            }

            agendamentos.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

            agendamentos.forEach(ag => {
                const li = document.createElement('li');
                li.className = 'medico-item';

                let htmlAcoes = '';
                if (ag.status === 'PENDENTE' || ag.status === 'CONFIRMADO') {
                    htmlAcoes = `
                        <div class="form-actions" style="justify-content: flex-end;">
                            <button class="btn-confirm btn-status-atendido" data-id="${ag.idAgendamento}">Marcar como Atendido</button>
                            <button class="btn-cancel btn-status-cancelado" data-id="${ag.idAgendamento}">Cancelar</button>
                        </div>
                    `;
                } else if (ag.status === 'ATENDIDO') {
                    htmlAcoes = `
                        <div class="form-actions" style="justify-content: flex-end; gap: 0.5rem;">
                            <button class="btn-primary-doc btn-criar-prescricao" data-paciente-id="${ag.paciente.id}" data-paciente-nome="${ag.paciente.nome}">+ Prescrição</button>
                            <button class="btn-secondary-doc btn-criar-atestado" data-paciente-id="${ag.paciente.id}" data-paciente-nome="${ag.paciente.nome}">+ Atestado</button>
                        </div>
                    `;
                } else {
                    htmlAcoes = `<p style="color: #555; text-align: right;">Consulta finalizada/cancelada.</p>`;
                }

                li.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <div style="flex-grow: 1;">
                            <strong>[${ag.status}] ${new Date(ag.dataHora).toLocaleString('pt-BR')}</strong><br>
                            <small>Paciente: ${ag.paciente.nome}</small>
                        </div>
                        ${htmlAcoes}
                    </div>
                `;
                listaUL.appendChild(li);
            });

            // Adiciona listeners aos botões
            document.querySelectorAll('.btn-status-atendido').forEach(btn => {
                btn.addEventListener('click', () => handleUpdateStatus(btn.dataset.id, 'ATENDIDO'));
            });
            document.querySelectorAll('.btn-status-cancelado').forEach(btn => {
                btn.addEventListener('click', () => handleUpdateStatus(btn.dataset.id, 'CANCELADO'));
            });
            document.querySelectorAll('.btn-criar-prescricao').forEach(btn => {
                btn.addEventListener('click', () => renderFormularioPrescricao(btn.dataset.pacienteId, btn.dataset.pacienteNome));
            });
            document.querySelectorAll('.btn-criar-atestado').forEach(btn => {
                btn.addEventListener('click', () => renderFormularioAtestado(btn.dataset.pacienteId, btn.dataset.pacienteNome));
            });

        } catch (err) {
            console.error(err);
            contentDinamico.innerHTML = '<li>Erro ao carregar agendamentos.</li>';
        }
    }

    async function handleUpdateStatus(agendamentoId, novoStatus) {
        // (Lógica anterior, sem alteração)
        const dto = { novoStatus: novoStatus };
        try {
            const response = await fetchAuthenticated(`/api/agendamentos/${agendamentoId}/status`, {
                method: 'PUT',
                body: JSON.stringify(dto)
            });
            if (response.ok) {
                alert(`Agendamento atualizado para ${novoStatus} com sucesso!`);
                renderMinhaAgenda();
            } else {
                await handleApiError(response, null);
            }
        } catch (err) {
            alert('Erro de rede ao atualizar status.');
        }
    }

    // ===================================================================
    // FUNÇÃO DE GERENCIAR HORÁRIOS (TOTALMENTE REESCRITA)
    // ===================================================================

    /**
     * Renderiza o CONSTRUTOR DE HORÁRIOS interativo
     */
    async function renderGerenciarHorarios() {
        const contentDinamico = document.getElementById('medico-content-dinamico');

        let htmlForm = `
            <h3>Meus Horários Disponíveis</h3>
            <p>Adicione ou remova os horários de atendimento (formato HH:mm) para cada dia.</p>
            <div id="horarios-error-message" class="error-message" style="display:none;"></div>
            <div class="schedule-builder">
        `;

        // Cria um card para cada dia da semana
        DIAS_DA_SEMANA.forEach(dia => {
            htmlForm += `
                <div class="schedule-day-card" id="card-${dia}">
                    <h5>${dia.charAt(0) + dia.slice(1).toLowerCase()}</h5>
                    <div class="add-time-form">
                        <input type="time" class="time-input" data-dia="${dia}">
                        <button type="button" class="btn-add-time" data-dia="${dia}">+</button>
                    </div>
                    <div class="time-tags-container" id="tags-${dia}">
                        </div>
                </div>
            `;
        });

        htmlForm += `</div><div class="form-actions" style="margin-top: 1.5rem;">
                        <button type="button" class="btn-confirm" id="btn-salvar-agenda">Salvar Agenda Completa</button>
                     </div>`;

        contentDinamico.innerHTML = htmlForm;

        // --- Lógica Pós-Renderização ---

        // Carrega a agenda atual da API para pré-popular
        try {
            const respHorarios = await fetchAuthenticated(`/api/medicos/${meuIdDeMedico}/horarios`);
            if (respHorarios && respHorarios.ok) {
                const agendaAtual = await respHorarios.json();
                if (agendaAtual.dias) {
                    agendaAtual.dias.forEach(diaInfo => {
                        diaInfo.horarios.forEach(hora => {
                            // Cria a tag de horário para cada horário salvo
                            criarTagDeHorario(diaInfo.dia, hora);
                        });
                    });
                }
            }
        } catch (e) {
            console.error("Erro ao buscar agenda atual para popular", e);
            // Não bloqueia a renderização, apenas não pré-popula
        }

        // Adiciona listener para todos os botões "+"
        document.querySelectorAll('.btn-add-time').forEach(button => {
            button.addEventListener('click', (e) => {
                const dia = e.target.dataset.dia;
                const input = document.querySelector(`.time-input[data-dia="${dia}"]`);
                if (input.value) {
                    criarTagDeHorario(dia, input.value);
                    input.value = ''; // Limpa o input
                }
            });
        });

        // Adiciona listener para o botão de Salvar Principal
        document.getElementById('btn-salvar-agenda').addEventListener('click', handleSalvarHorarios);
    }

    /**
     * Helper que cria o HTML da "tag" de horário e seu botão de remover
     */
    function criarTagDeHorario(diaSemana, horaString) {
        const container = document.getElementById(`tags-${diaSemana}`);
        const tag = document.createElement('div');
        tag.className = 'time-tag';
        tag.textContent = horaString;
        tag.dataset.hora = horaString; // Salva o valor

        const removeBtn = document.createElement('span');
        removeBtn.className = 'remove-tag';
        removeBtn.textContent = 'x';
        removeBtn.onclick = () => {
            tag.remove(); // Remove a tag do DOM
        };

        tag.appendChild(removeBtn);
        container.appendChild(tag);
    }

    /**
     * Handler que LÊ o DOM, MONTA o JSON e ENVIA para a API
     */
    async function handleSalvarHorarios(event) {
        event.preventDefault();
        const errorMessageDiv = document.getElementById('horarios-error-message');
        errorMessageDiv.style.display = 'none';

        // Constrói o DTO lendo as tags da tela
        const agendaDTO = { dias: [] };

        DIAS_DA_SEMANA.forEach(dia => {
            const container = document.getElementById(`tags-${dia}`);
            const tags = container.querySelectorAll('.time-tag');

            if (tags.length > 0) {
                const horarios = [];
                tags.forEach(tag => {
                    horarios.push(tag.dataset.hora);
                });
                agendaDTO.dias.push({ dia: dia, horarios: horarios.sort() }); // Salva os horários ordenados
            }
        });

        // Envia o DTO montado para a API
        try {
            const response = await fetchAuthenticated('/api/medicos/horarios', {
                method: 'PUT',
                body: JSON.stringify(agendaDTO)
            });

            if (response.ok) {
                alert('Horários salvos com sucesso!');
            } else {
                await handleApiError(response, 'horarios-error-message');
            }
        } catch (err) {
            errorMessageDiv.textContent = 'Erro de rede. Não foi possível salvar.';
            errorMessageDiv.style.display = 'block';
        }
    }

    // --- (Funções de criar prescrição/atestado que já fizemos) ---
    function renderFormularioPrescricao(pacienteId, pacienteNome) {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `
            <div class="booking-form-container">
                <h4>Nova Prescrição Médica</h4>
                <p>Paciente: <strong>${pacienteNome}</strong> (ID: ${pacienteId})</p>
                <form id="form-prescricao" style="margin-top: 1.5rem;">
                    <div id="doc-error-message" class="error-message" style="display:none;"></div>
                    <div class="input-group"><label>Medicamentos e Dosagem</label><textarea id="medicamentos" rows="10" required></textarea></div>
                    <div class="form-actions">
                        <button type="submit" class="btn-confirm">Salvar Prescrição</button>
                        <button type="button" class="btn-cancel" id="btn-cancelar-doc">Voltar</button>
                    </div>
                </form>
            </div>
        `;
        document.getElementById('btn-cancelar-doc').addEventListener('click', renderMinhaAgenda);
        document.getElementById('form-prescricao').addEventListener('submit', (e) => {
            e.preventDefault();
            const dto = {
                idPaciente: parseInt(pacienteId),
                medicamentos: document.getElementById('medicamentos').value
            };
            handleDocumentoSubmit('/api/prescricoes', dto, 'Prescrição salva com sucesso!');
        });
    }

    function renderFormularioAtestado(pacienteId, pacienteNome) {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `
            <div class="booking-form-container">
                <h4>Gerar Atestado Médico</h4>
                <p>Paciente: <strong>${pacienteNome}</strong> (ID: ${pacienteId})</p>
                <form id="form-atestado" style="margin-top: 1.5rem;">
                    <div id="doc-error-message" class="error-message" style="display:none;"></div>
                    <div class="input-group"><label>Descrição (CID, dias, etc)</label><textarea id="descricao" rows="10" required></textarea></div>
                    <div class="form-actions">
                        <button type="submit" class="btn-confirm">Salvar Atestado</button>
                        <button type="button" class="btn-cancel" id="btn-cancelar-doc">Voltar</button>
                    </div>
                </form>
            </div>
        `;
        document.getElementById('btn-cancelar-doc').addEventListener('click', renderMinhaAgenda);
        document.getElementById('form-atestado').addEventListener('submit', (e) => {
            e.preventDefault();
            const dto = {
                idPaciente: parseInt(pacienteId),
                descricao: document.getElementById('descricao').value
            };
            handleDocumentoSubmit('/api/atestados', dto, 'Atestado salvo com sucesso!');
        });
    }

    async function handleDocumentoSubmit(apiUrl, dto, successMessage) {
        try {
            const response = await fetchAuthenticated(apiUrl, dto.method || 'POST', dto);
            if (response.ok) {
                alert(successMessage);
                renderMinhaAgenda(); // Volta para a agenda
            } else {
                await handleApiError(response, 'doc-error-message');
            }
        } catch (err) {
            document.getElementById('doc-error-message').textContent = 'Erro de rede.';
            document.getElementById('doc-error-message').style.display = 'block';
        }
    }

    // Inicializa
    initMedicoDashboard();
});