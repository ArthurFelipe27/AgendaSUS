// ===================================================================
// MEDICO.JS (VERSÃO COMPLETA E CORRIGIDA)
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Área principal onde o conteúdo dinâmico do dashboard será renderizado
    const contentArea = document.getElementById('content-area');
    let meuIdDeMedico = null; // Armazena o ID do médico logado

    // Constantes para facilitar a manutenção
    const DIAS_DA_SEMANA = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO"];
    const LISTA_EXAMES_COMUNS = ["Hemograma Completo", "Colesterol Total e Frações", "Glicemia de Jejum", "Ureia e Creatinina", "Exame de Urina (EAS)", "Eletrocardiograma (ECG)", "Raio-X do Tórax", "Ultrassonografia Abdominal"];
    const SPINNER_HTML = `<div class="spinner-container"><div class="spinner"></div></div>`;

    /**
     * [CORREÇÃO] Função para limpar o editor TinyMCE antes de renderizar uma nova tela.
     * Isso evita erros de reinicialização do editor.
     */
    function cleanupBeforeRender() {
        // [CORREÇÃO] Verifica se o objeto 'tinymce' existe globalmente antes de usá-lo.
        // Isso evita erros caso o script do TinyMCE ainda não tenha sido totalmente carregado
        // ou em telas onde o editor não é utilizado.
        if (typeof tinymce !== 'undefined') {
            const editor = tinymce.get('conteudo-editor');
            if (editor) {
                editor.remove();
            }
        }
    }

    /**
     * Função principal que inicializa o dashboard do médico.
     * Busca os dados do médico e configura os cards principais.
     */
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

        // Renderiza a grade de cards do menu principal
        contentArea.innerHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card" id="card-minha-agenda">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-days"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
                    <span>Minha Agenda</span>
                </div>
                <div class="dashboard-card" id="card-historico">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-history"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    <span>Histórico</span>
                </div>
                <div class="dashboard-card" id="card-meus-horarios">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-clock"><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h5"/><path d="M17.5 17.5 16 16.25V14"/><circle cx="16" cy="16" r="5.5"/></svg>
                    <span>Meus Horários</span>
                </div>
                <div class="dashboard-card" id="card-novo-conteudo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-plus-2"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M3 15h6"/><path d="M6 12v6"/></svg>
                    <span>Novo Artigo</span>
                </div>
                 <div class="dashboard-card" id="card-meus-conteudos">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-files"><path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1V14c0 .8.6 1.4 1.4 1.4h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z"/><path d="M3 7.6v12.8c0 .8.6 1.4 1.4 1.4h9.8"/><path d="M15 2v5h5"/></svg>
                    <span>Meus Conteúdos</span>
                </div>
                 <div class="dashboard-card" id="card-meu-perfil">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
                    <span>Meu Perfil</span>
                </div>
            </div>
            <hr>
            <div id="medico-content-dinamico"></div>
        `;

        // Adiciona os listeners de evento para cada card
        document.getElementById('card-minha-agenda').addEventListener('click', renderMinhaAgenda);
        document.getElementById('card-historico').addEventListener('click', renderHistoricoDeAtendimentos);
        document.getElementById('card-meus-horarios').addEventListener('click', renderGerenciarHorarios);
        document.getElementById('card-novo-conteudo').addEventListener('click', () => renderFormularioConteudo());
        document.getElementById('card-meus-conteudos').addEventListener('click', renderMeusConteudos);
        document.getElementById('card-meu-perfil').addEventListener('click', renderMeuPerfil);

        // Configura o modal de pré-visualização de conteúdo
        const previewModal = document.getElementById('preview-modal');
        if (previewModal) {
            document.getElementById('preview-modal-close').addEventListener('click', closePreviewModal);
            previewModal.addEventListener('click', (e) => { if (e.target.id === 'preview-modal') closePreviewModal(); });
        }

        // Carrega a tela inicial da agenda
        await renderMinhaAgenda();
    }

    /**
     * Renderiza a lista de agendamentos ativos (Pendentes ou Confirmados).
     */
    async function renderMinhaAgenda() {
        cleanupBeforeRender();
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

    /**
     * Renderiza o histórico de atendimentos (Atendidos, Cancelados, etc.).
     */
    async function renderHistoricoDeAtendimentos() {
        cleanupBeforeRender();
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

    /**
     * Renderiza a tela de atendimento (ativa ou de histórico).
     * @param {number} agendamentoId ID do agendamento a ser exibido.
     * @param {boolean} isHistorico Flag para indicar se é uma visualização de histórico.
     */
    async function renderTelaDeAtendimento(agendamentoId, isHistorico = false) {
        cleanupBeforeRender();
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
                        <div class="atendimento-form-section">
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

    /**
     * Manipula o envio do formulário de finalização de consulta.
     * @param {number} agendamentoId ID do agendamento a ser finalizado.
     */
    async function handleFinalizarConsulta(agendamentoId) {
        const necessitaAtestado = document.querySelector('input[name="necessitaAtestado"]:checked').value === 'sim';
        const diasRepousoInput = document.getElementById('dias-repouso');
        let diasDeRepouso = null;
        if (necessitaAtestado) {
            if (!diasRepousoInput.value || diasRepousoInput.value < 1) {
                showToast("Por favor, informe um número válido de dias para o atestado.", "error"); return;
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

    /**
     * Renderiza a interface para gerenciar os horários de atendimento.
     */
    async function renderGerenciarHorarios() {
        cleanupBeforeRender();
        const contentDinamico = document.getElementById('medico-content-dinamico');
        const clockIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
        const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`;
        let htmlForm = `<div class="section-card"><div class="admin-section-header"><h3>Meus Horários Disponíveis</h3></div><p>Adicione os horários em que você está disponível. As alterações são salvas para as próximas semanas.</p><div id="horarios-error-message" class="error-message" style="display:none;"></div><div class="schedule-builder">`;
        DIAS_DA_SEMANA.forEach(dia => {
            htmlForm += `<div class="schedule-day-card" id="card-${dia}"><h5>${dia.charAt(0) + dia.slice(1).toLowerCase()}</h5><div class="add-time-form"><div class="time-input-wrapper">${clockIcon}<input type="time" class="time-input" data-dia="${dia}"></div><button type="button" class="btn-add-time" data-dia="${dia}" title="Adicionar horário">${plusIcon}</button></div><div class="time-tags-container" id="tags-${dia}"></div></div>`;
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
        if (!container) return;
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

    function openPreviewModal(title, content) {
        document.getElementById('preview-title').textContent = title;
        document.getElementById('preview-body').innerHTML = content;
        document.getElementById('preview-modal').style.display = 'flex';
    }

    function closePreviewModal() {
        document.getElementById('preview-modal').style.display = 'none';
    }

    async function renderMeusConteudos() {
        cleanupBeforeRender();
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<div class="admin-section-header"><h4>Meus Conteúdos</h4> <button class="btn btn-new" id="btn-criar-novo-conteudo">+ Criar Novo</button></div><div id="lista-meus-conteudos">${SPINNER_HTML}</div>`;
        document.getElementById('btn-criar-novo-conteudo').addEventListener('click', () => renderFormularioConteudo());

        try {
            const response = await fetchAuthenticated('/api/conteudo/meus');
            if (!response || !response.ok) throw new Error('Falha ao buscar seus conteúdos');
            const conteudos = await response.json();
            const container = document.getElementById('lista-meus-conteudos');
            if (conteudos.length === 0) {
                container.innerHTML = "<p>Você ainda não criou nenhum conteúdo.</p>";
                return;
            }
            let tableHTML = `<div class="admin-table-container"><table class="admin-table"><thead><tr><th>Título</th><th>Tipo</th><th>Status</th><th>Ações</th></tr></thead><tbody>`;
            conteudos.forEach(c => {
                const canEdit = c.status === 'RASCUNHO';
                tableHTML += `<tr><td>${c.titulo}</td><td>${c.tipo}</td><td><span class="badge ${c.status}">${c.status}</span></td><td><div class="form-actions" style="gap: 0.5rem;"><button class="btn btn-secondary btn-sm" data-action="visualizar" data-id="${c.id}">Visualizar</button><button class="btn btn-primary btn-sm" data-action="editar" data-id="${c.id}" ${!canEdit ? 'disabled' : ''}>Editar</button><button class="btn btn-danger btn-sm" data-action="deletar" data-id="${c.id}" ${!canEdit ? 'disabled' : ''}>Excluir</button></div></td></tr>`;
            });
            tableHTML += '</tbody></table></div>';
            container.innerHTML = tableHTML;

            container.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    const action = e.target.dataset.action;
                    const id = e.target.dataset.id;
                    if (action === 'visualizar') visualizarConteudo(id);
                    if (action === 'editar') editarConteudo(id);
                    if (action === 'deletar') deletarMeuConteudo(id);
                }
            });

        } catch (err) {
            console.error(err);
            document.getElementById('lista-meus-conteudos').innerHTML = "<p>Erro ao carregar seus conteúdos.</p>";
        }
    }

    async function visualizarConteudo(conteudoId) {
        try {
            const response = await fetchAuthenticated(`/api/conteudo/admin/${conteudoId}`);
            if (!response || !response.ok) {
                await handleApiError(response, null);
                return;
            };
            const conteudo = await response.json();
            openPreviewModal(conteudo.titulo, conteudo.corpo);
        } catch (err) {
            showToast(err.message || 'Erro de rede ao visualizar', 'error');
        }
    };

    function editarConteudo(conteudoId) {
        renderFormularioConteudo(conteudoId);
    };

    async function deletarMeuConteudo(conteudoId) {
        if (confirm("Tem certeza que deseja excluir este rascunho? Esta ação não pode ser desfeita.")) {
            try {
                const response = await fetchAuthenticated(`/api/conteudo/admin/${conteudoId}`, { method: 'DELETE' });
                if (response && response.ok) {
                    showToast("Rascunho excluído com sucesso!", 'success');
                    renderMeusConteudos();
                } else {
                    await handleApiError(response, null);
                }
            } catch (err) {
                showToast("Erro de rede ao excluir conteúdo.", 'error');
            }
        }
    };

    async function renderFormularioConteudo(conteudoId = null) {
        cleanupBeforeRender();
        const isEditing = conteudoId !== null;
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<div class="booking-form-container"><div class="admin-section-header"><h4>${isEditing ? 'Editar Conteúdo' : 'Criar Novo Conteúdo'}</h4><button class="btn btn-secondary" id="btn-voltar-conteudos">&larr; Voltar</button></div><form id="form-conteudo"><input type="hidden" id="conteudo-id" value="${conteudoId || ''}"><div id="conteudo-error-message" class="error-message" style="display:none;"></div><div class="input-group"><label>Título</label><input type="text" id="conteudo-titulo" required></div><div class="input-group"><label>Tipo</label><select id="conteudo-tipo" required><option value="NOTICIA">Notícia</option><option value="ARTIGO">Artigo</option><option value="OUTRO">Outro</option></select></div><div class="input-group"><label>Corpo do Conteúdo</label><textarea id="conteudo-editor"></textarea></div><div class="form-actions" style="justify-content: space-between;"><button type="button" class="btn btn-secondary" id="btn-preview">Pré-visualizar</button><div><button type="submit" class="btn btn-primary">Salvar Rascunho</button></div></div></form></div>`;
        document.getElementById('btn-voltar-conteudos').addEventListener('click', renderMeusConteudos);

        // [CORREÇÃO] Função recursiva para aguardar o carregamento do TinyMCE
        const initTinyMCE = () => {
            // Verifica se o objeto global 'tinymce' já está disponível
            if (typeof tinymce === 'undefined') {
                // Se não estiver, aguarda 100ms e tenta novamente
                setTimeout(initTinyMCE, 100);
                return;
            }

            // Se estiver disponível, inicializa o editor
            tinymce.init({
                selector: '#conteudo-editor',
                plugins: 'lists link image table code help wordcount autoresize',
                toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image | code',
                language: 'pt_BR',
                height: 700,
                menubar: false,
                setup: (editor) => {
                    editor.on('init', async () => {
                        if (isEditing) {
                            try {
                                const response = await fetchAuthenticated(`/api/conteudo/admin/${conteudoId}`);
                                if (!response || !response.ok) throw new Error('Conteúdo não encontrado');
                                const data = await response.json();
                                document.getElementById('conteudo-titulo').value = data.titulo;
                                document.getElementById('conteudo-tipo').value = data.tipo;
                                editor.setContent(data.corpo);
                            } catch (err) {
                                showToast(err.message, 'error');
                                renderMeusConteudos();
                            }
                        }
                    });
                }
            });
        };

        // Inicia a verificação e inicialização
        initTinyMCE();

        document.getElementById('btn-preview').addEventListener('click', () => {
            const title = document.getElementById('conteudo-titulo').value || "Sem Título";
            const editor = tinymce.get('conteudo-editor');
            if (editor) {
                const content = editor.getContent();
                openPreviewModal(title, content);
            } else {
                showToast("O editor ainda não foi carregado. Aguarde um momento.", "error");
            }
        });
        document.getElementById('form-conteudo').addEventListener('submit', handleConteudoSubmit);
    }

    async function handleConteudoSubmit(event) {
        event.preventDefault();

        // [CORREÇÃO] Garante que estamos interagindo com uma instância válida do editor
        const editor = tinymce.get('conteudo-editor');
        if (!editor) {
            showToast("O editor ainda não foi carregado. Aguarde um momento.", "error");
            return;
        }

        const corpoConteudo = editor.getContent();
        if (!corpoConteudo) {
            showToast('O corpo do conteúdo não pode estar vazio.', 'error');
            return;
        }
        const conteudoId = document.getElementById('conteudo-id').value;
        const isEditing = !!conteudoId;
        const url = isEditing ? `/api/conteudo/admin/${conteudoId}` : '/api/conteudo/admin';
        const method = isEditing ? 'PUT' : 'POST';
        const dto = {
            titulo: document.getElementById('conteudo-titulo').value,
            tipo: document.getElementById('conteudo-tipo').value,
            corpo: corpoConteudo,
            status: 'RASCUNHO' // Sempre salva como rascunho
        };
        try {
            const response = await fetchAuthenticated(url, { method: method, body: JSON.stringify(dto) });
            if (response && response.ok) {
                showToast(`Rascunho ${isEditing ? 'atualizado' : 'salvo'} com sucesso!`, 'success');
                renderMeusConteudos();
            }
            else { await handleApiError(response, 'conteudo-error-message'); }
        } catch (err) { showToast('Erro de rede ao salvar conteúdo.', 'error'); }
    }

    function renderMeuPerfil() {
        cleanupBeforeRender();
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

    // Inicia a execução do dashboard
    initMedicoDashboard();
});


