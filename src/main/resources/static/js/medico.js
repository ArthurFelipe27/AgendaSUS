// ===================================================================
// MEDICO.JS (VERSÃO COM MELHORIAS VISUAIS)
// Implementa ícones, spinners e um layout de card aprimorado.
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    let meuIdDeMedico = null;
    const DIAS_DA_SEMANA = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO"];
    const LISTA_EXAMES_COMUNS = ["Hemograma Completo", "Colesterol Total e Frações", "Glicemia de Jejum", "Ureia e Creatinina", "Exame de Urina (EAS)", "Eletrocardiograma (ECG)", "Raio-X do Tórax", "Ultrassonografia Abdominal"];
    const SPINNER_HTML = `<div class="spinner-container"><div class="spinner"></div></div>`;


    async function initMedicoDashboard() {
        try {
            const respMe = await fetchAuthenticated('/api/usuarios/me');
            if (!respMe || !respMe.ok) throw new Error('Falha ao buscar perfil do médico.');
            const usuario = await respMe.json();
            meuIdDeMedico = usuario.id;
        } catch (e) {
            console.error("Erro fatal ao buscar perfil do médico.", e);
            contentArea.innerHTML = "<p>Erro ao carregar dados. Faça login novamente.</p>";
            return;
        }

        // [MELHORIA VISUAL] Adicionados ícones SVG aos cards do dashboard.
        contentArea.innerHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card" id="card-minha-agenda">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>Minha Agenda (Ativas)</span>
                </div>
                <div class="dashboard-card" id="card-historico">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 21H3V3h12l6 6v12zM12 21v-8H3M15 3v6h6"></path></svg>
                    <span>Histórico de Atendimentos</span>
                </div>
                <div class="dashboard-card" id="card-meus-horarios">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span>Gerenciar Meus Horários</span>
                </div>
                <div class="dashboard-card" id="card-criar-conteudo">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                    <span>Criar Artigo/Notícia</span>
                </div>
                 <div class="dashboard-card" id="card-meu-perfil">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span>Meu Perfil</span>
                </div>
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
        contentDinamico.innerHTML = `<div class="section-card"><h3>Minha Agenda (Próximas Consultas)</h3><p>Clique em uma consulta para iniciar o atendimento.</p><div id="lista-agendamentos-medico" class="medico-list" style="margin-top: 1.5rem;">${SPINNER_HTML}</div></div>`;
        try {
            const response = await fetchAuthenticated('/api/agendamentos/meus');
            if (!response) return;
            const todosAgendamentos = await response.json();
            const agendamentosAtivos = todosAgendamentos.filter(ag => ag.status === 'PENDENTE' || ag.status === 'CONFIRMADO');
            const listaContainer = document.getElementById('lista-agendamentos-medico');
            listaContainer.innerHTML = '';
            if (agendamentosAtivos.length === 0) {
                listaContainer.innerHTML = '<p>Você não possui nenhuma consulta ativa.</p>';
                return;
            }
            agendamentosAtivos.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
            agendamentosAtivos.forEach(ag => {
                const item = document.createElement('div');
                item.className = 'agendamento-card status-' + ag.status;
                item.style.cursor = 'pointer';
                item.innerHTML = `<div><strong>${new Date(ag.dataHora).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}</strong><br><small>Paciente: ${ag.paciente.nome} | Status: <span class="badge status-${ag.status}">${ag.status}</span></small></div><span>Iniciar Atendimento &rarr;</span>`;
                listaContainer.appendChild(item);
                item.addEventListener('click', () => renderTelaDeAtendimento(ag.id));
            });
        } catch (err) { console.error(err); document.getElementById('lista-agendamentos-medico').innerHTML = '<p>Erro ao carregar agendamentos.</p>'; }
    }

    async function renderHistoricoDeAtendimentos() {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<div class="section-card"><h3>Histórico de Atendimentos</h3><p>Clique em um atendimento para rever o prontuário.</p><div id="lista-historico-medico" class="medico-list" style="margin-top: 1.5rem;">${SPINNER_HTML}</div></div>`;
        try {
            const response = await fetchAuthenticated('/api/agendamentos/meus');
            if (!response) return;
            const todosAgendamentos = await response.json();
            const agendamentosInativos = todosAgendamentos.filter(ag => ag.status !== 'PENDENTE' && ag.status !== 'CONFIRMADO');
            const listaContainer = document.getElementById('lista-historico-medico');
            listaContainer.innerHTML = '';
            if (agendamentosInativos.length === 0) {
                listaContainer.innerHTML = '<p>Nenhum atendimento no seu histórico.</p>';
                return;
            }
            agendamentosInativos.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
            agendamentosInativos.forEach(ag => {
                const item = document.createElement('div');
                item.className = 'agendamento-card status-' + ag.status;
                item.style.cursor = 'pointer';
                item.innerHTML = `<div><strong>${new Date(ag.dataHora).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}</strong><br><small>Paciente: ${ag.paciente.nome} | Status: <span class="badge status-${ag.status}">${ag.status.replace(/_/g, ' ')}</span></small></div><span>Ver Prontuário &rarr;</span>`;
                listaContainer.appendChild(item);
                item.addEventListener('click', () => renderTelaDeAtendimento(ag.id, true));
            });
        } catch (err) { console.error(err); document.getElementById('lista-historico-medico').innerHTML = '<p>Erro ao carregar histórico.</p>'; }
    }

    async function renderTelaDeAtendimento(agendamentoId, isHistorico = false) {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<div class="section-card">${SPINNER_HTML}</div>`;
        try {
            const response = await fetchAuthenticated(`/api/agendamentos/${agendamentoId}/prontuario`);
            if (!response || !response.ok) throw new Error('Falha ao carregar dados do atendimento.');
            const prontuario = await response.json();
            const consulta = prontuario.detalhesDaConsulta;

            if (isHistorico) {
                let examesHtml = '<h5>Exames Solicitados</h5>';
                if (consulta.exames && consulta.exames.length > 0) {
                    examesHtml += '<ul>';
                    consulta.exames.forEach(exame => { examesHtml += `<li>${exame}</li>`; });
                    examesHtml += '</ul>';
                } else { examesHtml += '<p>Nenhum exame solicitado nesta consulta.</p>'; }

                let prescricaoHtml = '<h5>Prescrição</h5>';
                if (consulta.prescricao) {
                    prescricaoHtml += `<pre>${consulta.prescricao}</pre>`;
                } else { prescricaoHtml += '<p>Nenhuma prescrição gerada para esta consulta.</p>'; }

                contentDinamico.innerHTML = `
                    <div class="admin-section-header"><h3>Prontuário do Atendimento</h3><button class="btn btn-secondary" id="btn-voltar-historico">&larr; Voltar ao Histórico</button></div>
                    <div class="document-item"><p><strong>Paciente:</strong> ${prontuario.nomePaciente}</p><p><strong>Data:</strong> ${new Date(consulta.data).toLocaleString('pt-BR')}</p></div><hr>
                    <div class="document-item" style="background-color: #f0f9ff;"><div class="ficha-detalhe"><strong>Sintomas Relatados:</strong><p>${consulta.sintomas || 'N/A'}</p></div><div class="ficha-detalhe"><strong>Evolução Médica:</strong><p>${consulta.evolucaoMedica || 'Nenhuma evolução registrada.'}</p></div></div><hr>
                    <div class="document-item">${prescricaoHtml}</div><hr><div class="document-item">${examesHtml}</div>`;
                document.getElementById('btn-voltar-historico').addEventListener('click', renderHistoricoDeAtendimentos);

            } else {
                let examesCheckboxesHtml = '';
                LISTA_EXAMES_COMUNS.forEach(exame => { examesCheckboxesHtml += `<div class="checkbox-group"><input type="checkbox" id="exame-${exame.replace(/\s+/g, '-')}" name="exames" value="${exame}"><label for="exame-${exame.replace(/\s+/g, '-')}">${exame}</label></div>`; });

                const diasSintomas = consulta.diasSintomas ? `${consulta.diasSintomas} dia(s)` : 'Não informado';

                // [MELHORIA FUNCIONAL] Adiciona campos de Alergias e Cirurgias
                contentDinamico.innerHTML = `
                    <div class="admin-section-header">
                        <h3>Atendimento em Andamento</h3>
                        <button class="btn btn-secondary" id="btn-voltar-agenda">&larr; Voltar para Agenda</button>
                    </div>
                    <div id="atendimento-error-message" class="error-message" style="display:none;"></div>

                    <div class="prontuario-grid">
                        <div class="info-card"><h5>Paciente</h5><p>${prontuario.nomePaciente} (${prontuario.idade || 'N/A'} anos)</p></div>
                        <div class="info-card"><h5>Telefone</h5><p>${prontuario.telefone || 'Não informado'}</p></div>
                        <div class="info-card full-width"><h5>Queixa Principal</h5><p>${consulta.sintomas} (há ${diasSintomas})</p></div>
                        <div class="info-card"><h5>Alergias</h5><p>${consulta.alergias || 'Nenhuma informada'}</p></div>
                        <div class="info-card"><h5>Cirurgias Prévias</h5><p>${consulta.cirurgias || 'Nenhuma informada'}</p></div>
                    </div>

                    <form id="form-finalizar-consulta" style="margin-top: 1.5rem;">
                        <div class="atendimento-form-section">
                            <h4>Evolução e Conduta</h4>
                            <div class="input-group"><label for="evolucao">Evolução Médica</label><textarea id="evolucao" rows="6" placeholder="Descreva a evolução do paciente, exame físico, etc."></textarea></div>
                            <div class="input-group"><label for="prescricao">Prescrição Médica</label><textarea id="prescricao" rows="6" placeholder="Ex: Dipirona 500mg, 1 comprimido de 6/6h por 3 dias se dor ou febre."></textarea></div>
                        </div>

                        <div class="atendimento-form-section" style="margin-top: 1.5rem;">
                             <h4>Exames e Atestado</h4>
                             <div class="input-group"><label>Solicitação de Exames</label><div class="checkbox-container">${examesCheckboxesHtml}</div></div>
                             <div class="input-group"><label>Necessita de Atestado?</label><div class="radio-group"><input type="radio" id="atestado-nao" name="necessitaAtestado" value="nao" checked> <label for="atestado-nao">Não</label><input type="radio" id="atestado-sim" name="necessitaAtestado" value="sim" style="margin-left: 1rem;"> <label for="atestado-sim">Sim</label></div></div>
                            <div id="atestado-dias-container" class="input-group" style="display: none;"><label for="dias-repouso">Dias de Repouso</label><input type="number" id="dias-repouso" min="1" placeholder="Informe o número de dias"></div>
                        </div>
                        
                        <div class="form-actions" style="margin-top: 2rem; justify-content: flex-end;"><button type="submit" class="btn btn-success">Finalizar e Salvar Consulta</button></div>
                    </form>
                `;

                document.getElementById('btn-voltar-agenda').addEventListener('click', renderMinhaAgenda);
                document.getElementById('form-finalizar-consulta').addEventListener('submit', (e) => { e.preventDefault(); handleFinalizarConsulta(agendamentoId); });
                document.querySelectorAll('input[name="necessitaAtestado"]').forEach(radio => {
                    radio.addEventListener('change', (e) => {
                        document.getElementById('atestado-dias-container').style.display = e.target.value === 'sim' ? 'block' : 'none';
                    });
                });
            }
        } catch (err) { console.error(err); contentDinamico.innerHTML = '<p>Erro ao carregar dados do atendimento.</p>'; }
    }

    async function handleFinalizarConsulta(agendamentoId) {
        const necessitaAtestado = document.querySelector('input[name="necessitaAtestado"]:checked').value === 'sim';
        const diasRepousoInput = document.getElementById('dias-repouso');
        let diasDeRepouso = null;
        if (necessitaAtestado) {
            if (!diasRepousoInput.value || diasRepousoInput.value < 1) {
                showToast("Por favor, informe um número válido de dias para o atestado.", "error");
                return;
            }
            diasDeRepouso = parseInt(diasRepousoInput.value);
        }
        const dto = {
            evolucaoMedica: document.getElementById('evolucao').value,
            prescricao: document.getElementById('prescricao').value,
            exames: Array.from(document.querySelectorAll('input[name="exames"]:checked')).map(cb => cb.value),
            diasDeRepouso: diasDeRepouso
        };
        try {
            const response = await fetchAuthenticated(`/api/agendamentos/${agendamentoId}/finalizar`, { method: 'POST', body: JSON.stringify(dto) });
            if (response && response.ok) {
                showToast('Consulta finalizada com sucesso!', 'success');
                renderHistoricoDeAtendimentos();
            } else { await handleApiError(response, 'atendimento-error-message'); }
        } catch (err) { showToast('Erro de rede ao finalizar a consulta.', 'error'); }
    }

    async function renderGerenciarHorarios() {
        const contentDinamico = document.getElementById('medico-content-dinamico');

        const clockIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
        const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`;

        let htmlForm = `
            <div class="section-card">
                <div class="admin-section-header"><h3>Meus Horários Disponíveis</h3></div>
                <p>Adicione os horários em que você está disponível. As alterações são salvas para as próximas semanas.</p>
                <div id="horarios-error-message" class="error-message" style="display:none;"></div>
                <div class="schedule-builder">`;

        DIAS_DA_SEMANA.forEach(dia => {
            htmlForm += `
                <div class="schedule-day-card" id="card-${dia}">
                    <h5>${dia.charAt(0) + dia.slice(1).toLowerCase()}</h5>
                    <div class="add-time-form">
                        <div class="time-input-wrapper">${clockIcon}<input type="time" class="time-input" data-dia="${dia}"></div>
                        <button type="button" class="btn-add-time" data-dia="${dia}" title="Adicionar horário">${plusIcon}</button>
                    </div>
                    <div class="time-tags-container" id="tags-${dia}"></div>
                </div>`;
        });

        htmlForm += `</div><div class="form-actions" style="margin-top: 2rem; justify-content: flex-end;"><button type="button" class="btn btn-primary" id="btn-salvar-agenda">Salvar Agenda</button></div></div>`;
        contentDinamico.innerHTML = htmlForm;
        try {
            const respHorarios = await fetchAuthenticated(`/api/medicos/${meuIdDeMedico}/horarios`);
            if (respHorarios && respHorarios.ok) {
                const agendaAtual = await respHorarios.json();
                if (agendaAtual.dias) { agendaAtual.dias.forEach(diaInfo => diaInfo.horarios.forEach(hora => criarTagDeHorario(diaInfo.dia, hora))); }
            }
        } catch (e) { console.error("Erro ao buscar agenda atual", e); }

        document.querySelectorAll('.btn-add-time').forEach(button => button.addEventListener('click', e => {
            const dia = e.currentTarget.dataset.dia;
            const input = document.querySelector(`.time-input[data-dia="${dia}"]`);
            if (input && input.value) { criarTagDeHorario(dia, input.value); input.value = ''; }
        }));

        document.getElementById('btn-salvar-agenda').addEventListener('click', handleSalvarHorarios);
    }

    function criarTagDeHorario(diaSemana, horaString) {
        const container = document.getElementById(`tags-${diaSemana.toUpperCase()}`);
        if (container.querySelector(`[data-hora="${horaString}"]`)) return;
        const tag = document.createElement('div');
        tag.className = 'time-tag';
        tag.dataset.hora = horaString;
        tag.innerHTML = `<span>${horaString}</span><button class="remove-tag" title="Remover horário"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>`;
        tag.querySelector('.remove-tag').onclick = () => tag.remove();
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

    function renderFormularioConteudo() {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<div class="booking-form-container"><h4>Criar Conteúdo</h4><p>Seu conteúdo será salvo como rascunho e enviado para aprovação de um administrador.</p><form id="form-conteudo"><div id="conteudo-error-message" class="error-message" style="display:none;"></div><div class="input-group"><label>Título</label><input type="text" id="conteudo-titulo" required></div><div class="input-group"><label>Tipo</label><select id="conteudo-tipo" required><option value="NOTICIA">Notícia</option><option value="ARTIGO">Artigo</option><option value="OUTRO">Outro</option></select></div><div class="input-group"><label>Corpo do Conteúdo</label><textarea id="conteudo-corpo" rows="15" required></textarea></div><div class="form-actions" style="justify-content: flex-end;"><button type="submit" class="btn btn-primary">Enviar para Aprovação</button></div></form></div>`;
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
        contentDinamico.innerHTML = `<div class="section-card"><h3>Meu Perfil</h3><div id="perfil-info">${SPINNER_HTML}</div></div><div class="section-card" style="margin-top: 1.5rem;"><h4>Alterar Senha</h4><form id="form-alterar-senha"><div id="senha-error-message" class="error-message" style="display:none;"></div><div class="input-group"><label>Nova Senha</label><input type="password" id="nova-senha" required minlength="6"></div><div class="input-group"><label>Confirme</label><input type="password" id="confirma-senha" required></div><div class="form-actions" style="justify-content: flex-end;"><button type="submit" class="btn btn-success">Salvar Nova Senha</button></div></form></div>`;
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
            } else { await handleApiError(response, 'senha-error-message'); }
        } catch (err) { showToast('Erro de rede ao alterar senha.', 'error'); }
    }

    initMedicoDashboard();
});

