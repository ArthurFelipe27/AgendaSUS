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
                <div class="dashboard-card" id="card-minha-agenda">Minha Agenda (Ativas)</div>
                <div class="dashboard-card" id="card-historico">Histórico de Atendimentos</div>
                <div class="dashboard-card" id="card-meus-horarios">Gerenciar Meus Horários</div>
                <div class="dashboard-card" id="card-criar-conteudo">Criar Artigo/Notícia</div>
                <div class="dashboard-card" id="card-meu-perfil">Meu Perfil</div>
            </div>
            <hr>
            <div id="medico-content-dinamico"></div>
        `;

        document.getElementById('card-minha-agenda').addEventListener('click', renderMinhaAgenda);
        document.getElementById('card-historico').addEventListener('click', renderHistoricoDeAtendimentos);
        document.getElementById('card-meus-horarios').addEventListener('click', renderGerenciarHorarios);
        document.getElementById('card-criar-conteudo').addEventListener('click', renderFormularioConteudo);
        document.getElementById('card-meu-perfil').addEventListener('click', renderMeuPerfil);

        await renderMinhaAgenda();
    }

    async function renderMinhaAgenda() {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<h3>Minha Agenda (Próximas Consultas)</h3><ul id="lista-agendamentos-medico" class="medico-list"><li>Carregando...</li></ul>`;
        try {
            const response = await fetchAuthenticated('/api/agendamentos/meus');
            if (!response.ok) throw new Error("Erro ao buscar agendamentos.");
            const todosAgendamentos = await response.json();
            const agendamentosAtivos = todosAgendamentos.filter(ag => ag.status === 'PENDENTE' || ag.status === 'CONFIRMADO');
            const listaUL = document.getElementById('lista-agendamentos-medico');
            listaUL.innerHTML = '';
            if (agendamentosAtivos.length === 0) {
                listaUL.innerHTML = '<li>Você não possui nenhuma consulta ativa.</li>';
                return;
            }
            agendamentosAtivos.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
            agendamentosAtivos.forEach(ag => {
                const li = document.createElement('li');
                li.className = 'medico-item-clicavel';
                li.dataset.agendamentoId = ag.idAgendamento;
                const htmlAcoes = `<div class="form-actions" style="justify-content: flex-end;"><button class="btn-confirm btn-status-atendido" data-id="${ag.idAgendamento}">Marcar como Atendido</button><button class="btn-cancel btn-status-cancelado" data-id="${ag.idAgendamento}">Cancelar</button></div>`;
                li.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;"><div style="flex-grow: 1;"><strong>[${ag.status}] ${new Date(ag.dataHora).toLocaleString('pt-BR')}</strong><br><small>Paciente: ${ag.paciente.nome}</small></div>${htmlAcoes}</div>`;
                listaUL.appendChild(li);
                li.addEventListener('click', e => { if (e.target.tagName !== 'BUTTON') handleVerFicha(ag.idAgendamento); });
            });
            document.querySelectorAll('.btn-status-atendido').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); handleUpdateStatus(btn.dataset.id, 'ATENDIDO'); }));
            document.querySelectorAll('.btn-status-cancelado').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); handleUpdateStatus(btn.dataset.id, 'CANCELADO'); }));
        } catch (err) { console.error(err); contentDinamico.innerHTML = '<li>Erro ao carregar agendamentos.</li>'; }
    }

    async function renderHistoricoDeAtendimentos() {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<h3>Histórico de Atendimentos</h3><ul id="lista-historico-medico" class="medico-list"><li>Carregando...</li></ul>`;
        try {
            const response = await fetchAuthenticated('/api/agendamentos/meus');
            if (!response.ok) throw new Error("Erro ao buscar agendamentos.");
            const todosAgendamentos = await response.json();
            const agendamentosInativos = todosAgendamentos.filter(ag => ag.status !== 'PENDENTE' && ag.status !== 'CONFIRMADO');
            const listaUL = document.getElementById('lista-historico-medico');
            listaUL.innerHTML = '';
            if (agendamentosInativos.length === 0) {
                listaUL.innerHTML = '<li>Nenhum atendimento no seu histórico.</li>';
                return;
            }
            agendamentosInativos.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
            agendamentosInativos.forEach(ag => {
                const li = document.createElement('li');
                li.className = 'medico-item-clicavel';
                let htmlAcoes = '';
                if (ag.status === 'ATENDIDO') {
                    htmlAcoes = `<div class="form-actions" style="justify-content: flex-end; gap: 0.5rem;"><button class="btn-primary-doc btn-criar-prescricao" data-paciente-id="${ag.paciente.id}" data-paciente-nome="${ag.paciente.nome}">+ Prescrição</button><button class="btn-secondary-doc btn-criar-atestado" data-paciente-id="${ag.paciente.id}" data-paciente-nome="${ag.paciente.nome}">+ Atestado</button><button class="btn-confirm btn-criar-exame" data-paciente-id="${ag.paciente.id}" data-paciente-nome="${ag.paciente.nome}">+ Exame</button></div>`;
                } else {
                    htmlAcoes = `<p style="color: #555; text-align: right;">Consulta ${ag.status.toLowerCase().replace('_', ' ')}</p>`;
                }
                li.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;"><div style="flex-grow: 1;"><strong>[${ag.status}] ${new Date(ag.dataHora).toLocaleString('pt-BR')}</strong><br><small>Paciente: ${ag.paciente.nome}</small></div>${htmlAcoes}</div>`;
                listaUL.appendChild(li);
                li.addEventListener('click', e => { if (e.target.tagName !== 'BUTTON') handleVerFicha(ag.idAgendamento); });
            });
            document.querySelectorAll('.btn-criar-prescricao').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); renderFormularioPrescricao(btn.dataset.pacienteId, btn.dataset.pacienteNome); }));
            document.querySelectorAll('.btn-criar-atestado').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); renderFormularioAtestado(btn.dataset.pacienteId, btn.dataset.pacienteNome); }));
            document.querySelectorAll('.btn-criar-exame').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); renderFormularioExame(btn.dataset.pacienteId, btn.dataset.pacienteNome); }));
        } catch (err) { console.error(err); contentDinamico.innerHTML = '<li>Erro ao carregar histórico.</li>'; }
    }

    async function handleUpdateStatus(agendamentoId, novoStatus) {
        const dto = { novoStatus: novoStatus };
        try {
            const response = await fetchAuthenticated(`/api/agendamentos/${agendamentoId}/status`, { method: 'PUT', body: JSON.stringify(dto) });
            if (response.ok) {
                showToast(`Agendamento atualizado para ${novoStatus}!`, 'success');
                renderMinhaAgenda();
            } else {
                const error = await response.json();
                showToast(error.message || 'Não foi possível atualizar o status.', 'error');
            }
        } catch (err) {
            showToast('Erro de rede ao atualizar status.', 'error');
        }
    }

    async function handleVerFicha(agendamentoId) {
        try {
            const response = await fetchAuthenticated(`/api/fichas-medicas/agendamento/${agendamentoId}`);
            if (!response.ok) throw new Error('Falha ao buscar ficha médica');
            const ficha = await response.json();
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `<div class="modal-content"><button class="modal-close">&times;</button><h4>Ficha Médica</h4><p>Paciente: <strong>${ficha.paciente.nome}</strong></p><div class="ficha-detalhe"><strong>Sintomas:</strong><p>${ficha.sintomas || 'N/A'}</p></div><div class="ficha-detalhe"><strong>Dias com Sintomas:</strong><p>${ficha.diasSintomas || 'N/A'}</p></div><div class="ficha-detalhe"><strong>Alergias:</strong><p>${ficha.alergias || 'N/A'}</p></div><div class="ficha-detalhe"><strong>Cirurgias:</strong><p>${ficha.cirurgias || 'N/A'}</p></div></div>`;
            document.body.appendChild(modal);
            modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        } catch (err) { showToast("Não foi possível carregar a ficha médica.", "error"); }
    }

    async function renderGerenciarHorarios() {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        let htmlForm = `<h3>Meus Horários Disponíveis</h3><p>Adicione ou remova horários.</p><div id="horarios-error-message" class="error-message" style="display:none;"></div><div class="schedule-builder">`;
        DIAS_DA_SEMANA.forEach(dia => { htmlForm += `<div class="schedule-day-card" id="card-${dia}"><h5>${dia.charAt(0) + dia.slice(1).toLowerCase()}</h5><div class="add-time-form"><input type="time" class="time-input" data-dia="${dia}"><button type="button" class="btn-add-time" data-dia="${dia}">+</button></div><div class="time-tags-container" id="tags-${dia}"></div></div>`; });
        htmlForm += `</div><div class="form-actions" style="margin-top: 1.5rem;"><button type="button" class="btn-confirm" id="btn-salvar-agenda">Salvar Agenda</button></div>`;
        contentDinamico.innerHTML = htmlForm;
        try {
            const respHorarios = await fetchAuthenticated(`/api/medicos/${meuIdDeMedico}/horarios`);
            if (respHorarios && respHorarios.ok) {
                const agendaAtual = await respHorarios.json();
                if (agendaAtual.dias) { agendaAtual.dias.forEach(diaInfo => diaInfo.horarios.forEach(hora => criarTagDeHorario(diaInfo.dia, hora))); }
            }
        } catch (e) { console.error("Erro ao buscar agenda atual", e); }
        document.querySelectorAll('.btn-add-time').forEach(button => {
            button.addEventListener('click', e => {
                const dia = e.target.dataset.dia;
                const input = document.querySelector(`.time-input[data-dia="${dia}"]`);
                if (input.value) { criarTagDeHorario(dia, input.value); input.value = ''; }
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
        removeBtn.textContent = '×';
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
            if (response.ok) { showToast('Horários salvos com sucesso!', 'success'); }
            else { await handleApiError(response, 'horarios-error-message'); }
        } catch (err) { showToast('Erro de rede ao salvar horários.', 'error'); }
    }

    function renderFormularioPrescricao(pacienteId, pacienteNome) {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<div class="booking-form-container"><h4>Nova Prescrição</h4><p>Paciente: <strong>${pacienteNome}</strong></p><form id="form-prescricao" style="margin-top: 1.5rem;"><div id="doc-error-message" class="error-message" style="display:none;"></div><div class="input-group"><label>Medicamentos</label><textarea id="medicamentos" rows="10" required></textarea></div><div class="form-actions"><button type="submit" class="btn-confirm">Salvar</button><button type="button" class="btn-cancel" id="btn-voltar">Voltar</button></div></form></div>`;
        document.getElementById('btn-voltar').addEventListener('click', renderHistoricoDeAtendimentos);
        document.getElementById('form-prescricao').addEventListener('submit', e => {
            e.preventDefault();
            const dto = { idPaciente: parseInt(pacienteId), medicamentos: document.getElementById('medicamentos').value };
            handleDocumentoSubmit('/api/prescricoes', dto, 'Prescrição salva!');
        });
    }

    function renderFormularioAtestado(pacienteId, pacienteNome) {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<div class="booking-form-container"><h4>Gerar Atestado</h4><p>Paciente: <strong>${pacienteNome}</strong></p><form id="form-atestado" style="margin-top: 1.5rem;"><div id="doc-error-message" class="error-message" style="display:none;"></div><div class="input-group"><label>Descrição</label><textarea id="descricao" rows="10" required></textarea></div><div class="form-actions"><button type="submit" class="btn-confirm">Salvar</button><button type="button" class="btn-cancel" id="btn-voltar">Voltar</button></div></form></div>`;
        document.getElementById('btn-voltar').addEventListener('click', renderHistoricoDeAtendimentos);
        document.getElementById('form-atestado').addEventListener('submit', e => {
            e.preventDefault();
            const dto = { idPaciente: parseInt(pacienteId), descricao: document.getElementById('descricao').value };
            handleDocumentoSubmit('/api/atestados', dto, 'Atestado salvo!');
        });
    }

    function renderFormularioExame(pacienteId, pacienteNome) {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<div class="booking-form-container"><h4>Solicitar Exame</h4><p>Paciente: <strong>${pacienteNome}</strong></p><form id="form-exame" style="margin-top: 1.5rem;"><div id="doc-error-message" class="error-message" style="display:none;"></div><div class="input-group"><label>Tipo de Exame</label><input type="text" id="exame-tipo" required></div><div class="input-group"><label>Data</label><input type="date" id="exame-data" required></div><div class="form-actions"><button type="submit" class="btn-confirm">Salvar</button><button type="button" class="btn-cancel" id="btn-voltar">Voltar</button></div></form></div>`;
        document.getElementById('btn-voltar').addEventListener('click', renderHistoricoDeAtendimentos);
        document.getElementById('form-exame').addEventListener('submit', e => {
            e.preventDefault();
            const dto = { idPaciente: parseInt(pacienteId), tipo: document.getElementById('exame-tipo').value, dataRealizacao: document.getElementById('exame-data').value };
            handleDocumentoSubmit('/api/exames', dto, 'Exame solicitado!');
        });
    }

    function renderFormularioConteudo() {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<div class="booking-form-container"><h4>Criar Conteúdo</h4><p>Será salvo como rascunho para aprovação.</p><form id="form-conteudo" style="margin-top: 1.5rem;"><div id="conteudo-error-message" class="error-message" style="display:none;"></div><div class="input-group"><label>Título</label><input type="text" id="conteudo-titulo" required></div><div class="input-group"><label>Tipo</label><select id="conteudo-tipo" required><option value="NOTICIA">Notícia</option><option value="ARTIGO">Artigo</option><option value="OUTRO">Outro</option></select></div><div class="input-group"><label>Corpo</label><textarea id="conteudo-corpo" rows="15" required></textarea></div><div class="form-actions"><button type="submit" class="btn-confirm">Salvar Rascunho</button></div></form></div>`;
        document.getElementById('form-conteudo').addEventListener('submit', handleConteudoSubmit);
    }

    async function handleConteudoSubmit(event) {
        event.preventDefault();
        const dto = { titulo: document.getElementById('conteudo-titulo').value, tipo: document.getElementById('conteudo-tipo').value, corpo: document.getElementById('conteudo-corpo').value };
        try {
            const response = await fetchAuthenticated('/api/conteudo/admin', { method: 'POST', body: JSON.stringify(dto) });
            if (response.ok) { showToast('Conteúdo salvo como rascunho!', 'success'); document.getElementById('form-conteudo').reset(); }
            else { await handleApiError(response, 'conteudo-error-message'); }
        } catch (err) { showToast('Erro de rede.', 'error'); }
    }

    async function handleDocumentoSubmit(apiUrl, dto, successMessage) {
        try {
            const response = await fetchAuthenticated(apiUrl, { method: 'POST', body: JSON.stringify(dto) });
            if (response.ok) { showToast(successMessage, 'success'); renderHistoricoDeAtendimentos(); }
            else { await handleApiError(response, 'doc-error-message'); }
        } catch (err) {
            console.error("Erro ao salvar documento:", err);
            showToast('Erro de rede ao salvar documento.', 'error');
        }
    }

    async function renderMeuPerfil() {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<h3>Meu Perfil</h3><div id="perfil-info" class="document-item">Carregando...</div><hr><h4>Alterar Senha</h4><div class="booking-form-container"><form id="form-alterar-senha"><div id="senha-error-message" class="error-message" style="display:none;"></div><div class="input-group"><label for="nova-senha">Nova Senha</label><input type="password" id="nova-senha" required minlength="6"></div><div class="input-group"><label for="confirma-senha">Confirme</label><input type="password" id="confirma-senha" required></div><div class="form-actions"><button type="submit" class="btn-confirm">Salvar</button></div></form></div>`;
        try {
            const response = await fetchAuthenticated('/api/usuarios/me');
            if (!response.ok) throw new Error('Falha ao buscar perfil.');
            const usuario = await response.json();
            document.getElementById('perfil-info').innerHTML = `<p><strong>Nome:</strong> ${usuario.nome}</p><p><strong>Email:</strong> ${usuario.email}</p><p><strong>CPF:</strong> ${usuario.cpf}</p>${usuario.crm ? `<p><strong>CRM:</strong> ${usuario.crm}</p>` : ''}`;
        } catch (err) {
            document.getElementById('perfil-info').innerHTML = '<p>Erro ao carregar perfil.</p>';
        }
        document.getElementById('form-alterar-senha').addEventListener('submit', handleUpdatePassword);
    }

    async function handleUpdatePassword(event) {
        event.preventDefault();
        const novaSenha = document.getElementById('nova-senha').value;
        const confirmaSenha = document.getElementById('confirma-senha').value;
        if (novaSenha !== confirmaSenha) {
            showToast('As senhas não coincidem.', 'error');
            return;
        }
        const dto = { senha: novaSenha };
        try {
            const response = await fetchAuthenticated(`/api/usuarios/${meuIdDeMedico}`, { method: 'PUT', body: JSON.stringify(dto) });
            if (response.ok) {
                showToast('Senha alterada! Você será deslogado.', 'success');
                setTimeout(logout, 2000);
            } else {
                await handleApiError(response, 'senha-error-message');
            }
        } catch (err) {
            showToast('Erro de rede ao alterar senha.', 'error');
        }
    }

    initMedicoDashboard();
});