// ===================================================================
// MEDICO.JS (VERSÃO FINAL - COM PRONTUÁRIO COMPLETO)
// ===================================================================
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
        contentDinamico.innerHTML = `<h3>Minha Agenda (Próximas Consultas)</h3><p>Clique em uma consulta para ver o prontuário do paciente.</p><ul id="lista-agendamentos-medico" class="medico-list"><li>Carregando...</li></ul>`;
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
                const htmlAcoes = `<div class="form-actions" style="justify-content: flex-end;"><button class="btn-confirm btn-status-atendido" data-id="${ag.idAgendamento}">Marcar como Atendido</button><button class="btn-cancel btn-status-cancelado" data-id="${ag.idAgendamento}">Cancelar</button></div>`;
                li.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;"><div style="flex-grow: 1;"><strong>[${ag.status}] ${new Date(ag.dataHora).toLocaleString('pt-BR')}</strong><br><small>Paciente: ${ag.paciente.nome}</small></div>${htmlAcoes}</div>`;
                listaUL.appendChild(li);
                // MUDANÇA AQUI: Passando o ID do AGENDAMENTO
                li.addEventListener('click', e => { if (e.target.tagName !== 'BUTTON') renderProntuarioPaciente(ag.idAgendamento); });
            });
            document.querySelectorAll('.btn-status-atendido').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); handleUpdateStatus(btn.dataset.id, 'ATENDIDO'); }));
            document.querySelectorAll('.btn-status-cancelado').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); handleUpdateStatus(btn.dataset.id, 'CANCELADO'); }));
        } catch (err) { console.error(err); contentDinamico.innerHTML = '<li>Erro ao carregar agendamentos.</li>'; }
    }


    async function renderHistoricoDeAtendimentos() {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<h3>Histórico de Atendimentos</h3><p>Clique em um atendimento para ver o prontuário.</p><ul id="lista-historico-medico" class="medico-list"><li>Carregando...</li></ul>`;
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
                // ... (código para htmlAcoes continua o mesmo)
                let htmlAcoes = '';
                if (ag.status === 'ATENDIDO') { /* ... */ } else { /* ... */ }
                li.innerHTML = `<div style="display: flex; ...">${htmlAcoes}</div>`; // Resumido por brevidade
                listaUL.appendChild(li);
                // MUDANÇA AQUI: Passando o ID do AGENDAMENTO
                li.addEventListener('click', e => { if (e.target.tagName !== 'BUTTON') renderProntuarioPaciente(ag.idAgendamento); });
            });
            // ... (listeners de botões continuam os mesmos)
        } catch (err) { console.error(err); contentDinamico.innerHTML = '<li>Erro ao carregar histórico.</li>'; }
    }

    /**
     * NOVA FUNÇÃO: Busca o prontuário completo e renderiza na tela
     */
    async function renderProntuarioPaciente(agendamentoId) { // Recebe ID do agendamento
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<div>Carregando prontuário...</div>`;

        try {
            // MUDANÇA AQUI: Chamando a nova API
            const response = await fetchAuthenticated(`/api/agendamentos/${agendamentoId}/prontuario`);
            if (!response || !response.ok) throw new Error('Falha ao carregar prontuário.');

            // O resto da função continua o mesmo...
            const prontuario = await response.json();
            // ...
            contentDinamico.innerHTML = `... (renderização do prontuário) ...`;
            // ...
            document.getElementById('btn-voltar-agenda').addEventListener('click', renderMinhaAgenda);
        } catch (err) {
            console.error(err);
            contentDinamico.innerHTML = '<p>Erro ao carregar prontuário do paciente.</p>';
        }
    }

    // Em: static/js/medico.js
    // SUBSTITUA A FUNÇÃO INTEIRA ABAIXO:

    async function renderProntuarioPaciente(pacienteId) {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<div>Carregando prontuário...</div>`;

        try {
            const response = await fetchAuthenticated(`/api/pacientes/${pacienteId}/prontuario`);
            if (!response || !response.ok) throw new Error('Falha ao carregar prontuário.');
            const prontuario = await response.json();

            const proximaConsultaStr = prontuario.proximaConsulta
                ? new Date(prontuario.proximaConsulta).toLocaleString('pt-BR')
                : 'Nenhuma';

            // Constrói o HTML da ficha da consulta mais recente (se existir)
            let fichaRecenteHtml = '<p>Nenhuma queixa recente registrada.</p>';
            if (prontuario.fichaConsultaMaisRecente) {
                const ficha = prontuario.fichaConsultaMaisRecente;
                fichaRecenteHtml = `
                <div class="ficha-detalhe"><strong>Sintomas Relatados:</strong><p>${ficha.sintomas || 'Não informado'}</p></div>
                <div class="ficha-detalhe"><strong>Dias com Sintomas:</strong><p>${ficha.diasSintomas || 'Não informado'}</p></div>
                <div class="ficha-detalhe"><strong>Alergias Conhecidas:</strong><p>${ficha.alergias || 'Não informado'}</p></div>
                <div class="ficha-detalhe"><strong>Cirurgias Prévias:</strong><p>${ficha.cirurgias || 'Não informado'}</p></div>
            `;
            }

            contentDinamico.innerHTML = `
            <div class="admin-section-header">
                <h3>Prontuário de Paciente</h3>
                <button class="btn-cancel" id="btn-voltar-agenda">&larr; Voltar para Agenda</button>
            </div>
            <div class="document-item">
                <p><strong>Nome:</strong> ${prontuario.nome}</p>
                <p><strong>Idade:</strong> ${prontuario.idade} anos</p>
                <p><strong>Email:</strong> ${prontuario.email}</p>
                <p><strong>Telefone:</strong> ${prontuario.telefone}</p>
            </div>
            <div class="prontuario-stats">
                <div class="stat-card"><div class="value">${prontuario.totalConsultasComMedico}</div><div class="label">Consultas comigo</div></div>
                <div class="stat-card"><div class="value">${prontuario.temExames ? 'Sim' : 'Não'}</div><div class="label">Possui Exames</div></div>
                <div class="stat-card"><div class="value">${proximaConsultaStr}</div><div class="label">Próxima Consulta</div></div>
            </div>
            <hr>
            
            <h4>Queixa Principal (Último Registro)</h4>
            <div class="document-item" style="background-color: #fffaf0;">
                ${fichaRecenteHtml}
            </div>
            <hr>

            <h4>Histórico de Consultas Atendidas</h4>
            <div id="historico-consultas-container"></div>
        `;

            const histContainer = document.getElementById('historico-consultas-container');
            if (prontuario.historicoConsultas.length === 0) {
                histContainer.innerHTML = '<p>Nenhuma consulta anterior registrada com este médico.</p>';
            } else {
                prontuario.historicoConsultas.forEach(consulta => {
                    histContainer.innerHTML += `
                    <div class="historico-item">
                        <p class="data">${new Date(consulta.data).toLocaleString('pt-BR')}</p>
                        <p class="sintomas"><strong>Sintomas:</strong> ${consulta.sintomas}</p>
                    </div>
                `;
                });
            }
            document.getElementById('btn-voltar-agenda').addEventListener('click', renderMinhaAgenda);

        } catch (err) {
            console.error(err);
            contentDinamico.innerHTML = '<p>Erro ao carregar prontuário do paciente.</p>';
        }
    }

    // Colei abaixo para garantir que esteja completo:
    async function handleUpdateStatus(agendamentoId, novoStatus) {
        const dto = { novoStatus: novoStatus };
        try {
            const response = await fetchAuthenticated(`/api/agendamentos/${agendamentoId}/status`, { method: 'PUT', body: JSON.stringify(dto) });
            if (response && response.ok) {
                showToast(`Agendamento atualizado para ${novoStatus}!`, 'success');
                renderMinhaAgenda();
            } else {
                await handleApiError(response, null);
            }
        } catch (err) { showToast('Erro de rede ao atualizar status.', 'error'); }
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
            if (response && response.ok) { showToast('Horários salvos com sucesso!', 'success'); }
            else { await handleApiError(response, 'horarios-error-message'); }
        } catch (err) { showToast('Erro de rede ao salvar horários.', 'error'); }
    }

    function renderFormularioPrescricao(pacienteId, pacienteNome) {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<div class="booking-form-container"><h4>Nova Prescrição</h4><p>Paciente: <strong>${pacienteNome}</strong></p><form id="form-documento"><div id="doc-error-message" class="error-message" style="display:none;"></div><div class="input-group"><label>Medicamentos</label><textarea id="medicamentos" rows="10" required></textarea></div><div class="form-actions"><button type="submit" class="btn-confirm">Salvar</button><button type="button" class="btn-cancel" id="btn-voltar">Voltar</button></div></form></div>`;
        document.getElementById('btn-voltar').addEventListener('click', renderHistoricoDeAtendimentos);
        document.getElementById('form-documento').addEventListener('submit', e => {
            e.preventDefault();
            const dto = { idPaciente: parseInt(pacienteId), medicamentos: document.getElementById('medicamentos').value };
            handleDocumentoSubmit('/api/prescricoes', dto, 'Prescrição salva!');
        });
    }

    function renderFormularioAtestado(pacienteId, pacienteNome) {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<div class="booking-form-container"><h4>Gerar Atestado</h4><p>Paciente: <strong>${pacienteNome}</strong></p><form id="form-documento"><div id="doc-error-message" class="error-message" style="display:none;"></div><div class="input-group"><label>Descrição</label><textarea id="descricao" rows="10" required></textarea></div><div class="form-actions"><button type="submit" class="btn-confirm">Salvar</button><button type="button" class="btn-cancel" id="btn-voltar">Voltar</button></div></form></div>`;
        document.getElementById('btn-voltar').addEventListener('click', renderHistoricoDeAtendimentos);
        document.getElementById('form-documento').addEventListener('submit', e => {
            e.preventDefault();
            const dto = { idPaciente: parseInt(pacienteId), descricao: document.getElementById('descricao').value };
            handleDocumentoSubmit('/api/atestados', dto, 'Atestado salvo!');
        });
    }

    function renderFormularioExame(pacienteId, pacienteNome) {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<div class="booking-form-container"><h4>Solicitar Exame</h4><p>Paciente: <strong>${pacienteNome}</strong></p><form id="form-documento"><div id="doc-error-message" class="error-message" style="display:none;"></div><div class="input-group"><label>Tipo</label><input type="text" id="exame-tipo" required></div><div class="input-group"><label>Data</label><input type="date" id="exame-data" required></div><div class="form-actions"><button type="submit" class="btn-confirm">Salvar</button><button type="button" class="btn-cancel" id="btn-voltar">Voltar</button></div></form></div>`;
        document.getElementById('btn-voltar').addEventListener('click', renderHistoricoDeAtendimentos);
        document.getElementById('form-documento').addEventListener('submit', e => {
            e.preventDefault();
            const dto = { idPaciente: parseInt(pacienteId), tipo: document.getElementById('exame-tipo').value, dataRealizacao: document.getElementById('exame-data').value };
            handleDocumentoSubmit('/api/exames', dto, 'Exame solicitado!');
        });
    }

    async function handleDocumentoSubmit(apiUrl, dto, successMessage) {
        try {
            const response = await fetchAuthenticated(apiUrl, { method: 'POST', body: JSON.stringify(dto) });
            if (response && response.ok) { showToast(successMessage, 'success'); renderHistoricoDeAtendimentos(); }
            else { await handleApiError(response, 'doc-error-message'); }
        } catch (err) {
            console.error("Erro ao salvar documento:", err);
            showToast('Erro de rede ao salvar documento.', 'error');
        }
    }

    function renderFormularioConteudo() {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<div class="booking-form-container"><h4>Criar Conteúdo</h4><p>Será salvo como rascunho para aprovação.</p><form id="form-conteudo"><div id="conteudo-error-message" class="error-message" style="display:none;"></div><div class="input-group"><label>Título</label><input type="text" id="conteudo-titulo" required></div><div class="input-group"><label>Tipo</label><select id="conteudo-tipo" required><option value="NOTICIA">Notícia</option><option value="ARTIGO">Artigo</option><option value="OUTRO">Outro</option></select></div><div class="input-group"><label>Corpo</label><textarea id="conteudo-corpo" rows="15" required></textarea></div><div class="form-actions"><button type="submit" class="btn-confirm">Salvar</button></div></form></div>`;
        document.getElementById('form-conteudo').addEventListener('submit', handleConteudoSubmit);
    }

    async function handleConteudoSubmit(event) {
        event.preventDefault();
        const dto = { titulo: document.getElementById('conteudo-titulo').value, tipo: document.getElementById('conteudo-tipo').value, corpo: document.getElementById('conteudo-corpo').value };
        try {
            const response = await fetchAuthenticated('/api/conteudo/admin', { method: 'POST', body: JSON.stringify(dto) });
            if (response && response.ok) { showToast('Conteúdo salvo como rascunho!', 'success'); document.getElementById('form-conteudo').reset(); }
            else { await handleApiError(response, 'conteudo-error-message'); }
        } catch (err) { showToast('Erro de rede.', 'error'); }
    }

    function renderMeuPerfil() {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<h3>Meu Perfil</h3><div id="perfil-info" class="document-item">Carregando...</div><hr><h4>Alterar Senha</h4><div class="booking-form-container"><form id="form-alterar-senha"><div id="senha-error-message" class="error-message" style="display:none;"></div><div class="input-group"><label>Nova Senha</label><input type="password" id="nova-senha" required minlength="6"></div><div class="input-group"><label>Confirme</label><input type="password" id="confirma-senha" required></div><div class="form-actions"><button type="submit" class="btn-confirm">Salvar</button></div></form></div>`;
        try {
            fetchAuthenticated('/api/usuarios/me').then(response => response.json()).then(usuario => {
                document.getElementById('perfil-info').innerHTML = `<p><strong>Nome:</strong> ${usuario.nome}</p><p><strong>Email:</strong> ${usuario.email}</p><p><strong>CPF:</strong> ${usuario.cpf}</p>${usuario.crm ? `<p><strong>CRM:</strong> ${usuario.crm}</p>` : ''}`;
            });
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
            if (response && response.ok) {
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