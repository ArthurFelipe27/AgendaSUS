document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    let meuIdDeMedico = null;

    const DIAS_DA_SEMANA = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO"];

    async function initMedicoDashboard() {
        try {
            const respMe = await fetchAuthenticated('/api/usuarios/me');
            if (!respMe.ok) throw new Error('Falha ao buscar perfil do médico.');
            const usuario = await respMe.json();
            meuIdDeMedico = usuario.id;
        } catch (e) {
            console.error("Erro fatal ao buscar perfil do médico.", e);
            contentArea.innerHTML = "<p>Erro ao carregar dados. Faça login novamente.</p>";
            return;
        }

        contentArea.innerHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card" id="card-minha-agenda">Ver Minha Agenda</div>
                <div class="dashboard-card" id="card-meus-horarios">Gerenciar Meus Horários</div>
                <div class="dashboard-card" id="card-criar-conteudo">Criar Artigo/Notícia</div>
            </div>
            <hr>
            <div id="medico-content-dinamico"></div>
        `;

        document.getElementById('card-minha-agenda').addEventListener('click', renderMinhaAgenda);
        document.getElementById('card-meus-horarios').addEventListener('click', renderGerenciarHorarios);
        document.getElementById('card-criar-conteudo').addEventListener('click', renderFormularioConteudo);

        await renderMinhaAgenda();
    }

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
                        </div>`;
                } else if (ag.status === 'ATENDIDO') {
                    htmlAcoes = `
                        <div class="form-actions" style="justify-content: flex-end; gap: 0.5rem;">
                            <button class="btn-primary-doc btn-criar-prescricao" data-paciente-id="${ag.paciente.id}" data-paciente-nome="${ag.paciente.nome}">+ Prescrição</button>
                            <button class="btn-secondary-doc btn-criar-atestado" data-paciente-id="${ag.paciente.id}" data-paciente-nome="${ag.paciente.nome}">+ Atestado</button>
                        </div>`;
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
                    </div>`;
                listaUL.appendChild(li);
            });
            document.querySelectorAll('.btn-status-atendido').forEach(btn => btn.addEventListener('click', () => handleUpdateStatus(btn.dataset.id, 'ATENDIDO')));
            document.querySelectorAll('.btn-status-cancelado').forEach(btn => btn.addEventListener('click', () => handleUpdateStatus(btn.dataset.id, 'CANCELADO')));
            document.querySelectorAll('.btn-criar-prescricao').forEach(btn => btn.addEventListener('click', () => renderFormularioPrescricao(btn.dataset.pacienteId, btn.dataset.pacienteNome)));
            document.querySelectorAll('.btn-criar-atestado').forEach(btn => btn.addEventListener('click', () => renderFormularioAtestado(btn.dataset.pacienteId, btn.dataset.pacienteNome)));
        } catch (err) {
            console.error(err);
            contentDinamico.innerHTML = '<li>Erro ao carregar agendamentos.</li>';
        }
    }

    async function handleUpdateStatus(agendamentoId, novoStatus) {
        const dto = { novoStatus: novoStatus };
        try {
            const response = await fetchAuthenticated(`/api/agendamentos/${agendamentoId}/status`, { method: 'PUT', body: JSON.stringify(dto) });
            if (response.ok) {
                alert(`Agendamento atualizado para ${novoStatus} com sucesso!`);
                renderMinhaAgenda();
            } else {
                await handleApiError(response, 'medico-content-dinamico');
            }
        } catch (err) {
            alert('Erro de rede ao atualizar status.');
        }
    }

    async function renderGerenciarHorarios() {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        let htmlForm = `
            <h3>Meus Horários Disponíveis</h3>
            <p>Adicione ou remova os horários de atendimento para cada dia.</p>
            <div id="horarios-error-message" class="error-message" style="display:none;"></div>
            <div class="schedule-builder">`;
        DIAS_DA_SEMANA.forEach(dia => {
            htmlForm += `
                <div class="schedule-day-card" id="card-${dia}">
                    <h5>${dia.charAt(0) + dia.slice(1).toLowerCase()}</h5>
                    <div class="add-time-form">
                        <input type="time" class="time-input" data-dia="${dia}">
                        <button type="button" class="btn-add-time" data-dia="${dia}">+</button>
                    </div>
                    <div class="time-tags-container" id="tags-${dia}"></div>
                </div>`;
        });
        htmlForm += `</div><div class="form-actions" style="margin-top: 1.5rem;"><button type="button" class="btn-confirm" id="btn-salvar-agenda">Salvar Agenda Completa</button></div>`;
        contentDinamico.innerHTML = htmlForm;
        try {
            const respHorarios = await fetchAuthenticated(`/api/medicos/${meuIdDeMedico}/horarios`);
            if (respHorarios && respHorarios.ok) {
                const agendaAtual = await respHorarios.json();
                if (agendaAtual.dias) {
                    agendaAtual.dias.forEach(diaInfo => diaInfo.horarios.forEach(hora => criarTagDeHorario(diaInfo.dia, hora)));
                }
            }
        } catch (e) { console.error("Erro ao buscar agenda atual para popular", e); }
        document.querySelectorAll('.btn-add-time').forEach(button => {
            button.addEventListener('click', e => {
                const dia = e.target.dataset.dia;
                const input = document.querySelector(`.time-input[data-dia="${dia}"]`);
                if (input.value) {
                    criarTagDeHorario(dia, input.value);
                    input.value = '';
                }
            });
        });
        document.getElementById('btn-salvar-agenda').addEventListener('click', handleSalvarHorarios);
    }

    function criarTagDeHorario(diaSemana, horaString) {
        const container = document.getElementById(`tags-${diaSemana}`);
        if (container.querySelector(`[data-hora="${horaString}"]`)) return;
        const tag = document.createElement('div');
        tag.className = 'time-tag';
        tag.textContent = horaString;
        tag.dataset.hora = horaString;
        const removeBtn = document.createElement('span');
        removeBtn.className = 'remove-tag';
        removeBtn.textContent = 'x';
        removeBtn.onclick = () => tag.remove();
        tag.appendChild(removeBtn);
        container.appendChild(tag);
    }

    async function handleSalvarHorarios(event) {
        event.preventDefault();
        const agendaDTO = { dias: [] };
        DIAS_DA_SEMANA.forEach(dia => {
            const tags = document.querySelectorAll(`#tags-${dia} .time-tag`);
            if (tags.length > 0) {
                const horarios = Array.from(tags).map(tag => tag.dataset.hora);
                agendaDTO.dias.push({ dia: dia, horarios: horarios.sort() });
            }
        });
        try {
            const response = await fetchAuthenticated('/api/medicos/horarios', { method: 'PUT', body: JSON.stringify(agendaDTO) });
            if (response.ok) {
                alert('Horários salvos com sucesso!');
            } else {
                await handleApiError(response, 'horarios-error-message');
            }
        } catch (err) {
            document.getElementById('horarios-error-message').textContent = 'Erro de rede.';
            document.getElementById('horarios-error-message').style.display = 'block';
        }
    }

    function renderFormularioPrescricao(pacienteId, pacienteNome) {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `
            <div class="booking-form-container">
                <h4>Nova Prescrição Médica</h4><p>Paciente: <strong>${pacienteNome}</strong></p>
                <form id="form-prescricao" style="margin-top: 1.5rem;">
                    <div id="doc-error-message" class="error-message" style="display:none;"></div>
                    <div class="input-group"><label>Medicamentos</label><textarea id="medicamentos" rows="10" required></textarea></div>
                    <div class="form-actions"><button type="submit" class="btn-confirm">Salvar</button><button type="button" class="btn-cancel" id="btn-cancelar-doc">Voltar</button></div>
                </form>
            </div>`;
        document.getElementById('btn-cancelar-doc').addEventListener('click', renderMinhaAgenda);
        document.getElementById('form-prescricao').addEventListener('submit', e => {
            e.preventDefault();
            const dto = { idPaciente: parseInt(pacienteId), medicamentos: document.getElementById('medicamentos').value };
            handleDocumentoSubmit('/api/prescricoes', dto, 'Prescrição salva com sucesso!');
        });
    }

    function renderFormularioAtestado(pacienteId, pacienteNome) {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `
            <div class="booking-form-container">
                <h4>Gerar Atestado Médico</h4><p>Paciente: <strong>${pacienteNome}</strong></p>
                <form id="form-atestado" style="margin-top: 1.5rem;">
                    <div id="doc-error-message" class="error-message" style="display:none;"></div>
                    <div class="input-group"><label>Descrição</label><textarea id="descricao" rows="10" required></textarea></div>
                    <div class="form-actions"><button type="submit" class="btn-confirm">Salvar</button><button type="button" class="btn-cancel" id="btn-cancelar-doc">Voltar</button></div>
                </form>
            </div>`;
        document.getElementById('btn-cancelar-doc').addEventListener('click', renderMinhaAgenda);
        document.getElementById('form-atestado').addEventListener('submit', e => {
            e.preventDefault();
            const dto = { idPaciente: parseInt(pacienteId), descricao: document.getElementById('descricao').value };
            handleDocumentoSubmit('/api/atestados', dto, 'Atestado salvo com sucesso!');
        });
    }

    function renderFormularioConteudo() {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `
            <div class="booking-form-container">
                <h4>Criar Novo Conteúdo</h4>
                <p>O conteúdo será salvo como rascunho para aprovação do Diretor.</p>
                <form id="form-conteudo" style="margin-top: 1.5rem;">
                    <div id="conteudo-error-message" class="error-message" style="display:none;"></div>
                    <div class="input-group"><label for="conteudo-titulo">Título</label><input type="text" id="conteudo-titulo" required></div>
                    <div class="input-group"><label for="conteudo-tipo">Tipo</label><select id="conteudo-tipo" required><option value="NOTICIA">Notícia</option><option value="ARTIGO">Artigo</option><option value="OUTRO">Outro</option></select></div>
                    <div class="input-group"><label for="conteudo-corpo">Corpo do Texto</label><textarea id="conteudo-corpo" rows="15" required></textarea></div>
                    <div class="form-actions"><button type="submit" class="btn-confirm">Salvar Rascunho</button></div>
                </form>
            </div>`;
        document.getElementById('form-conteudo').addEventListener('submit', handleConteudoSubmit);
    }

    async function handleConteudoSubmit(event) {
        event.preventDefault();
        const dto = {
            titulo: document.getElementById('conteudo-titulo').value,
            tipo: document.getElementById('conteudo-tipo').value,
            corpo: document.getElementById('conteudo-corpo').value
        };
        try {
            const response = await fetchAuthenticated('/api/conteudo/admin', { method: 'POST', body: JSON.stringify(dto) });
            if (response.ok) {
                alert('Conteúdo salvo como rascunho!');
                document.getElementById('form-conteudo').reset();
            } else {
                await handleApiError(response, 'conteudo-error-message');
            }
        } catch (err) {
            document.getElementById('conteudo-error-message').textContent = 'Erro de rede.';
            document.getElementById('conteudo-error-message').style.display = 'block';
        }
    }

    /**
     * Função GERAL para salvar documentos (Prescrição ou Atestado)
     * !!! ESTA É A VERSÃO 100% CORRIGIDA !!!
     */
    async function handleDocumentoSubmit(apiUrl, dto, successMessage) {
        try {
            // CORREÇÃO: Passa a URL e um OBJETO de opções contendo o método e o corpo
            const response = await fetchAuthenticated(apiUrl, {
                method: 'POST',
                body: JSON.stringify(dto)
            });

            if (response.ok) {
                alert(successMessage);
                renderMinhaAgenda(); // Volta para a agenda
            } else {
                await handleApiError(response, 'doc-error-message');
            }
        } catch (err) {
            console.error("Erro de rede ao salvar documento:", err);
            document.getElementById('doc-error-message').textContent = 'Erro de rede.';
            document.getElementById('doc-error-message').style.display = 'block';
        }
    }

    initMedicoDashboard();
});