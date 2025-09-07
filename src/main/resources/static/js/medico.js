document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    const token = localStorage.getItem('jwtToken'); // Pego do common.js? Não, common.js não expõe. Ok, pegamos de novo.

    // Inicializa o dashboard do médico
    async function initMedicoDashboard() {
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
        renderMinhaAgenda();
    }

    /**
     * Renderiza a lista de agendamentos do médico
     */
    async function renderMinhaAgenda() {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<h3>Meus Agendamentos</h3><ul id="lista-agendamentos-medico" class="medico-list"><li>Carregando...</li></ul>`;

        try {
            const response = await fetchAuthenticated('/api/agendamentos/meus'); // API que já criamos
            if (!response.ok) throw new Error("Erro ao buscar agendamentos.");

            const agendamentos = await response.json();
            const listaUL = document.getElementById('lista-agendamentos-medico');
            listaUL.innerHTML = '';

            if (agendamentos.length === 0) {
                listaUL.innerHTML = '<li>Você não possui agendamentos.</li>';
                return;
            }

            agendamentos.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora)); // Mais próximos primeiro

            agendamentos.forEach(ag => {
                const li = document.createElement('li');
                li.className = 'medico-item';
                li.innerHTML = `
                    <div>
                        <strong>[${ag.status}] ${new Date(ag.dataHora).toLocaleString('pt-BR')}</strong><br>
                        <small>Paciente: ${ag.paciente.nome}</small>
                    </div>
                    ${(ag.status === 'PENDENTE' || ag.status === 'CONFIRMADO') ?
                        `<div class="form-actions">
                            <button class="btn-confirm btn-status-atendido" data-id="${ag.idAgendamento}">Marcar como Atendido</button>
                            <button class="btn-delete btn-status-cancelado" data-id="${ag.idAgendamento}">Cancelar Consulta</button>
                        </div>` :
                        `<p>Consulta Finalizada.</p>`
                    }
                `;
                listaUL.appendChild(li);
            });

            // Adiciona listeners aos novos botões
            document.querySelectorAll('.btn-status-atendido').forEach(btn => {
                btn.addEventListener('click', () => handleUpdateStatus(btn.dataset.id, 'ATENDIDO'));
            });
            document.querySelectorAll('.btn-status-cancelado').forEach(btn => {
                btn.addEventListener('click', () => handleUpdateStatus(btn.dataset.id, 'CANCELADO'));
            });

        } catch (err) {
            console.error(err);
            contentDinamico.innerHTML = '<li>Erro ao carregar agendamentos.</li>';
        }
    }

    /**
     * Handler para chamar a API de atualização de status
     */
    async function handleUpdateStatus(agendamentoId, novoStatus) {
        const dto = { novoStatus: novoStatus };
        try {
            const response = await fetchAuthenticated(`/api/agendamentos/${agendamentoId}/status`, {
                method: 'PUT',
                body: JSON.stringify(dto)
            });

            if (response.ok) {
                alert(`Agendamento atualizado para ${novoStatus} com sucesso!`);
                renderMinhaAgenda(); // Recarrega a lista
            } else {
                const error = await response.json();
                alert(`Erro: ${error.message}`);
            }
        } catch (err) {
            alert('Erro de rede ao atualizar status.');
        }
    }

    /**
     * Renderiza o formulário para o médico definir seus horários
     */
    async function renderGerenciarHorarios() {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `
            <h3>Meus Horários Disponíveis</h3>
            <p>Defina seus dias e horários de atendimento. Isso substituirá sua agenda anterior.</p>
            
            <form id="form-horarios" class="login-form" style="padding:0; box-shadow:none;">
                 <div id="horarios-error-message" class="error-message" style="display:none;"></div>
                 <div class="input-group">
                    <label>Agenda (Formato JSON)</label>
                    <textarea id="agenda-json-input" rows="15" required></textarea>
                    <small>Insira sua agenda no formato JSON. Ex: {"dias": [{"dia": "SEGUNDA", "horarios": ["09:00"]}]}</small>
                 </div>
                 <button type="submit" class="btn-login">Salvar Horários</button>
            </form>
        `;

        // Busca os horários atuais para pré-popular o campo
        try {
            const response = await fetchAuthenticated(`/api/medicos/${localStorage.getItem('userId')}/horarios`); // Precisamos do ID do usuário logado

            // Oops, precisamos do ID do usuário, não do nome. Vamos buscar no /me.
            // Para simplificar agora, vamos buscar os horários do 'meu' perfil. 
            // A API de /me não retorna ID. Nosso localStorage não tem ID.

            // Correção Rápida: A API de horários do médico no backend já usa o SecurityContext. Não precisamos de ID.
            // Mas a API para LER os horários é /api/medicos/{id}/horarios. O médico precisa saber o próprio ID.
            // O token não tem o ID.
            // SOLUÇÃO: O login.js salvou o userName. Vamos buscar o /me.
            const respMe = await fetchAuthenticated('/api/usuarios/me');
            const usuario = await respMe.json();
            const meuId = usuario.id;

            const respHorarios = await fetchAuthenticated(`/api/medicos/${meuId}/horarios`);
            if (respHorarios.ok) {
                const agendaAtual = await respHorarios.json();
                // Usa JSON.stringify para formatar bonito (pretty-print)
                document.getElementById('agenda-json-input').value = JSON.stringify(agendaAtual, null, 4);
            }

        } catch (e) { console.error("Erro ao buscar agenda atual", e); }


        // Adiciona listener ao submit
        document.getElementById('form-horarios').addEventListener('submit', handleSalvarHorarios);
    }

    /**
     * Handler para enviar os horários para a API
     */
    async function handleSalvarHorarios(event) {
        event.preventDefault();
        const errorMessageDiv = document.getElementById('horarios-error-message');
        errorMessageDiv.style.display = 'none';
        const jsonInput = document.getElementById('agenda-json-input');

        let agendaDTO;
        try {
            // Valida se o texto é um JSON válido
            agendaDTO = JSON.parse(jsonInput.value);
        } catch (e) {
            errorMessageDiv.textContent = 'Erro: O texto inserido não é um JSON válido.';
            errorMessageDiv.style.display = 'block';
            return;
        }

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

    // Inicializa
    initMedicoDashboard();
});