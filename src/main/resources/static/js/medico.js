// ===================================================================
// MEDICO.JS (VERSÃO COMPLETA E ATUALIZADA)
// Inclui edição de perfil (Nome/Senha).
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Área principal onde o conteúdo dinâmico do dashboard será renderizado
    const contentArea = document.getElementById('content-area');
    let idUsuarioLogado = null; // Armazena o ID do médico logado
    let dadosUsuarioAtual = null; // Armazena os dados completos do médico logado

    // Constantes para facilitar a manutenção
    const DIAS_DA_SEMANA = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO"];
    const LISTA_EXAMES_COMUNS = ["Hemograma Completo", "Colesterol Total e Frações", "Glicemia de Jejum", "Ureia e Creatinina", "Exame de Urina (EAS)", "Eletrocardiograma (ECG)", "Raio-X do Tórax", "Ultrassonografia Abdominal"];
    const SPINNER_HTML = `<div class="spinner-container"><div class="spinner"></div></div>`;

    /**
     * Limpa o editor TinyMCE antes de renderizar uma nova tela.
     */
    function cleanupBeforeRender() {
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
            // Busca os dados completos do perfil do médico
            const respMe = await fetchAuthenticated('/api/usuarios/me');
            if (!respMe || !respMe.ok) throw new Error('Falha ao buscar perfil do médico.');
            dadosUsuarioAtual = await respMe.json(); // Armazena os dados
            idUsuarioLogado = dadosUsuarioAtual.id; // Guarda o ID

            // Atualiza a mensagem de boas-vindas
            const welcomeMsg = document.getElementById('welcome-message');
            if (welcomeMsg && dadosUsuarioAtual.nome) {
                welcomeMsg.textContent = `Seja bem-vindo(a), Dr(a). ${dadosUsuarioAtual.nome}!`; // Personaliza para médico
            }

        } catch (e) {
            console.error("Erro fatal ao buscar perfil do médico.", e);
            contentArea.innerHTML = "<p>Erro ao carregar dados. Faça login novamente.</p>";
            // Considerar deslogar
            // setTimeout(logout, 3000);
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
        document.getElementById('card-meu-perfil').addEventListener('click', renderMeuPerfil); // Atualizado

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
            if (!response || !response.ok) throw new Error('Falha ao buscar agendamentos');
            const todosAgendamentos = await response.json();

            // Filtra agendamentos futuros
            const agora = new Date();
            const agendamentosAtivos = todosAgendamentos
                .filter(ag => (ag.status === 'PENDENTE' || ag.status === 'CONFIRMADO') && new Date(ag.dataHora) >= agora)
                .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora)); // Ordena do mais próximo para o mais distante

            const listaContainer = document.getElementById('lista-agendamentos-medico');
            listaContainer.innerHTML = '';
            if (agendamentosAtivos.length === 0) {
                listaContainer.innerHTML = '<p>Você não possui nenhuma consulta ativa agendada.</p>';
                return;
            }
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
        contentDinamico.innerHTML = `<div class="section-card"><h3>Histórico de Atendimentos</h3><p>Clique em um atendimento "Atendido" para rever o prontuário.</p><div id="lista-historico-medico" class="medico-list" style="margin-top: 1.5rem;">${SPINNER_HTML}</div></div>`;
        try {
            const response = await fetchAuthenticated('/api/agendamentos/meus');
            if (!response || !response.ok) throw new Error('Falha ao buscar histórico');
            const todosAgendamentos = await response.json();

            // Filtra agendamentos passados ou com status finalizado
            const agora = new Date();
            const agendamentosInativos = todosAgendamentos
                .filter(ag => !(ag.status === 'PENDENTE' || ag.status === 'CONFIRMADO') || new Date(ag.dataHora) < agora)
                .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora)); // Mais recente primeiro

            const listaContainer = document.getElementById('lista-historico-medico');
            listaContainer.innerHTML = '';
            if (agendamentosInativos.length === 0) {
                listaContainer.innerHTML = '<p>Nenhum atendimento no seu histórico.</p>';
                return;
            }
            agendamentosInativos.forEach(ag => {
                const item = document.createElement('div');
                item.className = `agendamento-card status-${ag.status} ${ag.status === 'ATENDIDO' ? 'clickable-history' : ''}`; // Adiciona classe clicável
                item.style.cursor = ag.status === 'ATENDIDO' ? 'pointer' : 'default'; // Cursor só se for atendido
                const statusFormatado = ag.status.replace(/_/g, ' ');
                item.innerHTML = `
                    <div>
                        <strong>${new Date(ag.dataHora).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}</strong><br>
                        <small>Paciente: ${ag.paciente.nome} | Status: <span class="badge status-${ag.status}">${statusFormatado}</span></small>
                    </div>
                    <span>${ag.status === 'ATENDIDO' ? 'Ver Prontuário &rarr;' : ''}</span>`; // Só mostra seta se atendido
                listaContainer.appendChild(item);
                if (ag.status === 'ATENDIDO') { // Só adiciona click se foi atendido
                    item.addEventListener('click', () => renderTelaDeAtendimento(ag.id, true));
                }
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

            // Busca detalhes adicionais (prescrição, exames, atestado) para o histórico
            let prescricaoHist = null;
            let examesHist = [];
            let atestadoHist = null;
            if (isHistorico && consulta) {
                try {
                    const [respPresc, respAtest, respExames] = await Promise.all([
                        fetchAuthenticated(`/api/prescricoes/agendamento/${agendamentoId}`),
                        fetchAuthenticated(`/api/atestados/agendamento/${agendamentoId}`),
                        fetchAuthenticated(`/api/exames/agendamento/${agendamentoId}`)
                    ]);
                    prescricaoHist = (respPresc && respPresc.ok) ? await respPresc.json().catch(() => null) : null;
                    atestadoHist = (respAtest && respAtest.ok) ? await respAtest.json().catch(() => null) : null;
                    examesHist = (respExames && respExames.ok) ? await respExames.json().catch(() => []) : [];
                } catch (detalhesErr) {
                    console.error("Erro ao buscar detalhes pós-consulta:", detalhesErr);
                    showToast("Erro ao carregar detalhes completos do histórico.", "error");
                }
            }


            if (isHistorico) {
                let examesHtml = '<h5>Exames Solicitados</h5>';
                if (examesHist.length > 0) {
                    examesHtml += '<ul>';
                    examesHist.forEach(ex => {
                        const resultado = ex.resultado ? `: ${ex.resultado}` : ' (Resultado pendente)';
                        examesHtml += `<li><strong>${ex.tipo}</strong>${resultado}</li>`;
                    });
                    examesHtml += '</ul>';
                } else { examesHtml += '<p>Nenhum exame solicitado nesta consulta.</p>'; }

                let prescricaoHtml = '<h5>Prescrição</h5>';
                if (prescricaoHist && prescricaoHist.medicamentos) {
                    prescricaoHtml += `<pre>${prescricaoHist.medicamentos}</pre>`;
                } else { prescricaoHtml += '<p>Nenhuma prescrição gerada para esta consulta.</p>'; }

                let atestadoHtml = '<h5>Atestado</h5>';
                if (atestadoHist && atestadoHist.descricao) {
                    atestadoHtml += `<pre>${atestadoHist.descricao}</pre>`;
                } else { atestadoHtml += '<p>Nenhum atestado gerado para esta consulta.</p>'; }

                contentDinamico.innerHTML = `
                    <div class="section-card">
                        <div class="admin-section-header">
                            <h3>Prontuário do Atendimento</h3>
                            <button class="btn btn-secondary" id="btn-voltar-historico">&larr; Voltar ao Histórico</button>
                        </div>
                        <div class="document-item">
                            <p><strong>Paciente:</strong> ${prontuario.nomePaciente} (${prontuario.idade || 'N/A'} anos)</p>
                            <p><strong>Data:</strong> ${new Date(consulta.data).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}</p>
                        </div>
                        <hr>
                        <div class="document-item" style="background-color: #f0f9ff;">
                            <div class="ficha-detalhe"><strong>Sintomas Relatados:</strong><p>${consulta.sintomas || 'N/A'}</p></div>
                            <div class="ficha-detalhe"><strong>Alergias:</strong><p>${consulta.alergias || 'N/A'}</p></div>
                            <div class="ficha-detalhe"><strong>Cirurgias Prévias:</strong><p>${consulta.cirurgias || 'N/A'}</p></div>
                             <hr style="margin: 1rem 0;">
                            <div class="ficha-detalhe"><strong>Evolução Médica:</strong><p>${consulta.evolucaoMedica || 'Nenhuma evolução registrada.'}</p></div>
                        </div>
                        <hr>
                        <div class="document-item">${prescricaoHtml}</div>
                        <hr>
                        <div class="document-item">${atestadoHtml}</div>
                         <hr>
                         <div class="document-item">${examesHtml}</div>
                    </div>`;
                document.getElementById('btn-voltar-historico').addEventListener('click', renderHistoricoDeAtendimentos);

            } else { // Tela de Atendimento Ativo
                let examesCheckboxesHtml = '';
                LISTA_EXAMES_COMUNS.forEach(exame => { examesCheckboxesHtml += `<div class="checkbox-group"><input type="checkbox" id="exame-${exame.replace(/\s+/g, '-')}" name="exames" value="${exame}"><label for="exame-${exame.replace(/\s+/g, '-')}">${exame}</label></div>`; });

                const diasSintomas = consulta.diasSintomas ? `${consulta.diasSintomas} dia(s)` : 'Não informado';

                contentDinamico.innerHTML = `
                 <div class="section-card">
                    <div class="admin-section-header">
                        <h3>Atendimento em Andamento</h3>
                        <button class="btn btn-secondary" id="btn-voltar-agenda">&larr; Voltar para Agenda</button>
                    </div>
                    <div id="atendimento-error-message" class="error-message" style="display:none;"></div>
                    <div class="prontuario-grid">
                        <div class="info-card"><h5>Paciente</h5><p>${prontuario.nomePaciente} (${prontuario.idade || 'N/A'} anos)</p></div>
                        <div class="info-card"><h5>Telefone</h5><p>${formatTelefone(prontuario.telefone) || 'Não informado'}</p></div>
                        <div class="info-card full-width"><h5>Queixa Principal</h5><p>${consulta.sintomas} (há ${diasSintomas})</p></div>
                        <div class="info-card"><h5>Alergias</h5><p>${consulta.alergias || 'Nenhuma informada'}</p></div>
                        <div class="info-card"><h5>Cirurgias Prévias</h5><p>${consulta.cirurgias || 'Nenhuma informada'}</p></div>
                    </div>
                    <form id="form-finalizar-consulta" style="margin-top: 1.5rem;">
                        <div class="atendimento-form-section">
                            <h4>Evolução e Conduta *</h4>
                            <div class="input-group"><label for="evolucao">Evolução Médica (Obrigatório)</label><textarea id="evolucao" rows="6" placeholder="Descreva a evolução do paciente, exame físico, hipótese diagnóstica, etc." required></textarea></div>
                            <div class="input-group"><label for="prescricao">Prescrição Médica (Opcional)</label><textarea id="prescricao" rows="6" placeholder="Ex: Dipirona 500mg, 1 comprimido de 6/6h por 3 dias se dor ou febre."></textarea></div>
                        </div>
                        <div class="atendimento-form-section">
                             <h4>Exames e Atestado (Opcional)</h4>
                             <div class="input-group"><label>Solicitação de Exames</label><div class="checkbox-container">${examesCheckboxesHtml}</div></div>
                             <div class="input-group"><label>Necessita de Atestado?</label><div class="radio-group"><input type="radio" id="atestado-nao" name="necessitaAtestado" value="nao" checked> <label for="atestado-nao">Não</label><input type="radio" id="atestado-sim" name="necessitaAtestado" value="sim" style="margin-left: 1rem;"> <label for="atestado-sim">Sim</label></div></div>
                            <div id="atestado-dias-container" class="input-group" style="display: none;"><label for="dias-repouso">Dias de Repouso *</label><input type="number" id="dias-repouso" min="1" placeholder="Informe o número de dias"></div>
                        </div>
                        <div class="form-actions" style="margin-top: 2rem; justify-content: flex-end;"><button type="submit" class="btn btn-success">Finalizar e Salvar Consulta</button></div>
                    </form>
                </div>
                `;
                document.getElementById('btn-voltar-agenda').addEventListener('click', renderMinhaAgenda);
                document.getElementById('form-finalizar-consulta').addEventListener('submit', (e) => { e.preventDefault(); handleFinalizarConsulta(agendamentoId); });
                document.querySelectorAll('input[name="necessitaAtestado"]').forEach(radio => {
                    radio.addEventListener('change', (e) => {
                        const diasContainer = document.getElementById('atestado-dias-container');
                        const diasInput = document.getElementById('dias-repouso');
                        if (e.target.value === 'sim') {
                            diasContainer.style.display = 'block';
                            diasInput.required = true; // Torna obrigatório se marcar sim
                        } else {
                            diasContainer.style.display = 'none';
                            diasInput.required = false; // Não é obrigatório se marcar não
                            diasInput.value = ''; // Limpa o valor
                        }
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
        const evolucaoInput = document.getElementById('evolucao');
        if (!evolucaoInput.value || evolucaoInput.value.trim() === '') {
            showToast("O campo 'Evolução Médica' é obrigatório.", "error");
            evolucaoInput.focus();
            return;
        }

        const necessitaAtestado = document.querySelector('input[name="necessitaAtestado"]:checked').value === 'sim';
        const diasRepousoInput = document.getElementById('dias-repouso');
        let diasDeRepouso = null;
        if (necessitaAtestado) {
            if (!diasRepousoInput.value || diasRepousoInput.value < 1) {
                showToast("Por favor, informe um número válido de dias para o atestado.", "error");
                diasRepousoInput.focus();
                return;
            }
            diasDeRepouso = parseInt(diasRepousoInput.value);
        }

        const dto = {
            evolucaoMedica: evolucaoInput.value,
            prescricao: document.getElementById('prescricao').value,
            exames: Array.from(document.querySelectorAll('input[name="exames"]:checked')).map(cb => cb.value),
            diasDeRepouso: diasDeRepouso
        };

        const submitButton = document.querySelector('#form-finalizar-consulta button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Salvando...';
        const errorDiv = document.getElementById('atendimento-error-message');
        errorDiv.style.display = 'none';

        try {
            const response = await fetchAuthenticated(`/api/agendamentos/${agendamentoId}/finalizar`, { method: 'POST', body: JSON.stringify(dto) });
            if (response && response.ok) {
                showToast('Consulta finalizada com sucesso!', 'success');
                renderHistoricoDeAtendimentos(); // Vai para o histórico após finalizar
            } else { await handleApiError(response, 'atendimento-error-message'); }
        } catch (err) {
            console.error("Erro ao finalizar consulta:", err);
            showToast('Erro de rede ao finalizar a consulta.', 'error');
            errorDiv.textContent = 'Erro de rede. Verifique sua conexão.';
            errorDiv.style.display = 'block';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Finalizar e Salvar Consulta';
        }
    }

    /**
     * Renderiza a interface para gerenciar os horários de atendimento.
     */
    async function renderGerenciarHorarios() {
        cleanupBeforeRender();
        const contentDinamico = document.getElementById('medico-content-dinamico');
        const clockIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
        const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`;
        let htmlForm = `<div class="section-card"><div class="admin-section-header"><h3>Meus Horários Disponíveis</h3></div><p>Adicione os horários em que você está disponível (formato HH:MM, ex: 08:00, 14:30). As alterações são salvas para as próximas semanas.</p><div id="horarios-error-message" class="error-message" style="display:none;"></div><div class="schedule-builder">`;
        DIAS_DA_SEMANA.forEach(dia => {
            htmlForm += `<div class="schedule-day-card" id="card-${dia}"><h5>${dia.charAt(0) + dia.slice(1).toLowerCase()}</h5><div class="add-time-form"><div class="time-input-wrapper">${clockIcon}<input type="time" class="time-input" data-dia="${dia}"></div><button type="button" class="btn-add-time" data-dia="${dia}" title="Adicionar horário">${plusIcon}</button></div><div class="time-tags-container" id="tags-${dia}"></div></div>`;
        });
        htmlForm += `</div><div class="form-actions" style="margin-top: 2rem; justify-content: flex-end;"><button type="button" class="btn btn-primary" id="btn-salvar-agenda">Salvar Agenda</button></div></div>`;
        contentDinamico.innerHTML = htmlForm;
        try {
            const respHorarios = await fetchAuthenticated(`/api/medicos/${meuIdDeMedico}/horarios`);
            if (respHorarios && respHorarios.ok) {
                const agendaAtual = await respHorarios.json();
                if (agendaAtual.dias) {
                    agendaAtual.dias.forEach(diaInfo => {
                        // Garante que os horários são adicionados em ordem
                        diaInfo.horarios.sort().forEach(hora => criarTagDeHorario(diaInfo.dia, hora));
                    });
                }
            }
        } catch (e) { console.error("Erro ao buscar agenda atual", e); }
        document.querySelectorAll('.btn-add-time').forEach(button => button.addEventListener('click', e => {
            const dia = e.currentTarget.dataset.dia;
            const input = document.querySelector(`.time-input[data-dia="${dia}"]`);
            if (input && input.value) {
                criarTagDeHorario(dia, input.value);
                input.value = ''; // Limpa o input
                // Reordena as tags visualmente após adicionar
                reordenarTags(dia);
            }
        }));
        document.getElementById('btn-salvar-agenda').addEventListener('click', handleSalvarHorarios);
    }

    function criarTagDeHorario(diaSemana, horaString) {
        const container = document.getElementById(`tags-${diaSemana.toUpperCase()}`);
        if (!container) return;
        // Verifica se a tag já existe para evitar duplicatas
        if (container.querySelector(`[data-hora="${horaString}"]`)) return;

        const tag = document.createElement('div');
        tag.className = 'time-tag';
        tag.dataset.hora = horaString;
        tag.innerHTML = `<span>${horaString}</span><button type="button" class="remove-tag" title="Remover horário"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>`;
        tag.querySelector('.remove-tag').onclick = () => tag.remove();
        container.appendChild(tag);
    }

    // Função para reordenar as tags de horário visualmente
    function reordenarTags(diaSemana) {
        const container = document.getElementById(`tags-${diaSemana.toUpperCase()}`);
        if (!container) return;
        const tags = Array.from(container.querySelectorAll('.time-tag'));
        tags.sort((a, b) => a.dataset.hora.localeCompare(b.dataset.hora));
        tags.forEach(tag => container.appendChild(tag)); // Reinsere na ordem correta
    }


    async function handleSalvarHorarios(event) {
        event.preventDefault();
        const agendaDTO = { dias: [] };
        let hasErrors = false;
        const errorDiv = document.getElementById('horarios-error-message');
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';

        DIAS_DA_SEMANA.forEach(dia => {
            const container = document.getElementById(`tags-${dia}`);
            const tags = container.querySelectorAll('.time-tag');
            if (tags.length > 0) {
                const horarios = Array.from(tags).map(tag => tag.dataset.hora);
                // Validação simples de formato HH:MM (embora o input type="time" ajude)
                horarios.forEach(h => {
                    if (!/^[0-2][0-9]:[0-5][0-9]$/.test(h)) {
                        errorDiv.textContent += `Horário inválido '${h}' em ${dia}. Use o formato HH:MM.\n`;
                        hasErrors = true;
                    }
                });
                agendaDTO.dias.push({ dia: dia, horarios: horarios.sort() }); // Salva ordenado
            }
        });

        if (hasErrors) {
            errorDiv.style.display = 'block';
            showToast('Existem horários inválidos. Corrija-os antes de salvar.', 'error');
            return;
        }

        const submitButton = document.getElementById('btn-salvar-agenda');
        submitButton.disabled = true;
        submitButton.textContent = 'Salvando...';

        try {
            const response = await fetchAuthenticated('/api/medicos/horarios', { method: 'PUT', body: JSON.stringify(agendaDTO) });
            if (response && response.ok) { showToast('Horários salvos com sucesso!', 'success'); }
            else { await handleApiError(response, 'horarios-error-message'); }
        } catch (err) {
            console.error("Erro ao salvar horários:", err);
            showToast('Erro de rede ao salvar horários.', 'error');
            errorDiv.textContent = 'Erro de rede. Verifique sua conexão.';
            errorDiv.style.display = 'block';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Salvar Agenda';
        }
    }

    // --- Funções de Conteúdo (Médico) ---

    async function renderMeusConteudos() {
        cleanupBeforeRender();
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<div class="section-card"><div class="admin-section-header"><h4>Meus Conteúdos</h4> <button class="btn btn-new" id="btn-criar-novo-conteudo">+ Criar Novo</button></div><div id="lista-meus-conteudos">${SPINNER_HTML}</div></div>`;
        document.getElementById('btn-criar-novo-conteudo').addEventListener('click', () => renderFormularioConteudo());

        try {
            const response = await fetchAuthenticated('/api/conteudo/meus'); // Endpoint específico do médico
            if (!response || !response.ok) throw new Error('Falha ao buscar seus conteúdos');
            const conteudos = await response.json();
            const container = document.getElementById('lista-meus-conteudos');
            if (conteudos.length === 0) {
                container.innerHTML = "<p>Você ainda não criou nenhum conteúdo.</p>";
                return;
            }
            // Ordena por ID decrescente (mais recente primeiro)
            conteudos.sort((a, b) => b.id - a.id);

            let tableHTML = `<div class="admin-table-container"><table class="admin-table"><thead><tr><th>Título</th><th>Tipo</th><th>Status</th><th>Ações</th></tr></thead><tbody>`;
            conteudos.forEach(c => {
                const canEditOrDelete = c.status === 'RASCUNHO'; // Só pode editar/excluir rascunhos
                tableHTML += `
                    <tr>
                        <td>${c.titulo}</td>
                        <td>${c.tipo ? c.tipo.replace(/_/g, ' ') : 'N/A'}</td>
                        <td><span class="badge ${c.status}">${c.status}</span></td>
                        <td>
                            <div class="form-actions" style="gap: 0.5rem; justify-content: flex-start;">
                                <button class="btn btn-secondary btn-sm btn-visualizar-conteudo" data-id="${c.id}" title="Visualizar">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                </button>
                                <button class="btn btn-primary btn-sm btn-editar-conteudo" data-id="${c.id}" ${!canEditOrDelete ? 'disabled title="Só pode editar rascunhos"' : 'title="Editar Rascunho"'}>
                                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                </button>
                                <button class="btn btn-danger btn-sm btn-deletar-conteudo" data-id="${c.id}" ${!canEditOrDelete ? 'disabled title="Só pode excluir rascunhos"' : 'title="Excluir Rascunho"'}>
                                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                </button>
                            </div>
                        </td>
                    </tr>`;
            });
            tableHTML += '</tbody></table></div>';
            container.innerHTML = tableHTML;

            // Delegação de eventos para os botões da tabela
            container.addEventListener('click', (e) => {
                const button = e.target.closest('button');
                if (!button) return;

                const action = button.classList.contains('btn-visualizar-conteudo') ? 'visualizar'
                    : button.classList.contains('btn-editar-conteudo') ? 'editar'
                        : button.classList.contains('btn-deletar-conteudo') ? 'deletar'
                            : null;
                const id = button.dataset.id;

                if (action === 'visualizar') visualizarConteudoMedico(id);
                if (action === 'editar' && !button.disabled) editarConteudoMedico(id);
                if (action === 'deletar' && !button.disabled) deletarMeuConteudoMedico(id);
            });

        } catch (err) {
            console.error(err);
            document.getElementById('lista-meus-conteudos').innerHTML = "<p>Erro ao carregar seus conteúdos.</p>";
        }
    }

    // Visualiza qualquer conteúdo (o endpoint /admin/{id} permite acesso autenticado)
    async function visualizarConteudoMedico(conteudoId) {
        try {
            const response = await fetchAuthenticated(`/api/conteudo/admin/${conteudoId}`); // Usa o endpoint admin que permite visualização
            if (!response || !response.ok) {
                await handleApiError(response, null);
                return;
            };
            const conteudo = await response.json();
            openPreviewModal(conteudo.titulo, conteudo.corpo);
        } catch (err) {
            console.error("Erro ao visualizar:", err)
            showToast(err.message || 'Erro de rede ao visualizar', 'error');
        }
    };

    // Edita apenas rascunhos (o endpoint /admin/{id} PUT valida isso no backend)
    function editarConteudoMedico(conteudoId) {
        renderFormularioConteudo(conteudoId);
    };

    // Deleta apenas rascunhos (o endpoint /admin/{id} DELETE valida isso no backend)
    async function deletarMeuConteudoMedico(conteudoId) {
        showConfirmationModal("Tem certeza que deseja excluir este rascunho? Esta ação não pode ser desfeita.", async () => {
            try {
                const response = await fetchAuthenticated(`/api/conteudo/admin/${conteudoId}`, { method: 'DELETE' });
                if (response && response.ok) {
                    showToast("Rascunho excluído com sucesso!", 'success');
                    renderMeusConteudos(); // Recarrega a lista
                } else {
                    await handleApiError(response, null);
                }
            } catch (err) {
                console.error("Erro ao excluir rascunho:", err);
                showToast("Erro de rede ao excluir conteúdo.", 'error');
            }
        }, 'btn-danger');
    };

    // Renderiza o formulário para criar ou editar conteúdo
    async function renderFormularioConteudo(conteudoId = null) {
        cleanupBeforeRender();
        const isEditing = conteudoId !== null;
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `
            <div class="section-card">
                 <div class="admin-section-header">
                     <h4>${isEditing ? 'Editar Conteúdo' : 'Criar Novo Conteúdo'}</h4>
                     <button class="btn btn-secondary" id="btn-voltar-conteudos">&larr; Voltar para Meus Conteúdos</button>
                 </div>
                 <form id="form-conteudo">
                     <input type="hidden" id="conteudo-id" value="${conteudoId || ''}">
                     <div id="conteudo-error-message" class="error-message" style="display:none;"></div>
                     <div class="input-group">
                         <label for="conteudo-titulo">Título *</label>
                         <input type="text" id="conteudo-titulo" required>
                     </div>
                     <div class="input-group">
                         <label for="conteudo-tipo">Tipo *</label>
                         <select id="conteudo-tipo" required>
                             <option value="" disabled selected>Selecione...</option>
                             <option value="NOTICIA">Notícia</option>
                             <option value="ARTIGO">Artigo</option>
                             <option value="OUTRO">Outro</option>
                         </select>
                     </div>
                     <div class="input-group">
                         <label for="conteudo-editor">Corpo do Conteúdo *</label>
                         <textarea id="conteudo-editor"></textarea>
                     </div>
                     <div class="form-actions" style="justify-content: space-between; margin-top: 1rem;">
                         <button type="button" class="btn btn-secondary" id="btn-preview">Pré-visualizar</button>
                         <div>
                             <button type="submit" class="btn btn-primary">Salvar Rascunho</button>
                         </div>
                     </div>
                 </form>
            </div>`;
        document.getElementById('btn-voltar-conteudos').addEventListener('click', renderMeusConteudos);

        // Função recursiva para aguardar e inicializar o TinyMCE
        const initTinyMCE = async () => {
            if (typeof tinymce === 'undefined') {
                setTimeout(initTinyMCE, 100);
                return;
            }

            tinymce.init({
                selector: '#conteudo-editor',
                plugins: 'lists link image table code help wordcount autoresize',
                toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image | code',
                language: 'pt_BR',
                height: 500, // Altura inicial menor, autoresize vai ajustar
                menubar: false,
                autoresize_bottom_margin: 30,
                setup: (editor) => {
                    editor.on('init', async () => {
                        if (isEditing) {
                            try {
                                const response = await fetchAuthenticated(`/api/conteudo/admin/${conteudoId}`);
                                if (!response || !response.ok) throw new Error('Conteúdo não encontrado ou acesso negado');
                                const data = await response.json();
                                // Só permite editar se for RASCUNHO (embora o backend valide)
                                if (data.status !== 'RASCUNHO') {
                                    showToast('Este conteúdo não está em modo rascunho e não pode ser editado.', 'error');
                                    renderMeusConteudos();
                                    return;
                                }
                                document.getElementById('conteudo-titulo').value = data.titulo;
                                document.getElementById('conteudo-tipo').value = data.tipo;
                                editor.setContent(data.corpo || ''); // Garante que não é null
                            } catch (err) {
                                console.error("Erro ao carregar conteúdo para edição:", err);
                                showToast(err.message, 'error');
                                renderMeusConteudos(); // Volta pra lista se der erro
                            }
                        }
                    });
                }
            });
        };

        initTinyMCE(); // Inicia a tentativa de inicialização

        document.getElementById('btn-preview').addEventListener('click', () => {
            const title = document.getElementById('conteudo-titulo').value || "Sem Título";
            const editor = tinymce.get('conteudo-editor');
            if (editor) {
                const content = editor.getContent();
                openPreviewModal(title, content);
            } else {
                showToast("O editor ainda não foi totalmente carregado. Aguarde um momento.", "warning");
            }
        });
        document.getElementById('form-conteudo').addEventListener('submit', handleConteudoSubmit);
    }

    // Salva o conteúdo (cria novo ou atualiza rascunho)
    async function handleConteudoSubmit(event) {
        event.preventDefault();
        const editor = tinymce.get('conteudo-editor');
        if (!editor) {
            showToast("O editor não está pronto. Aguarde.", "error");
            return;
        }

        const tituloInput = document.getElementById('conteudo-titulo');
        const tipoInput = document.getElementById('conteudo-tipo');
        const corpoConteudo = editor.getContent();

        if (!tituloInput.value.trim()) {
            showToast('O título é obrigatório.', 'error');
            tituloInput.focus();
            return;
        }
        if (!tipoInput.value) {
            showToast('Selecione o tipo de conteúdo.', 'error');
            tipoInput.focus();
            return;
        }
        if (!corpoConteudo.trim()) {
            showToast('O corpo do conteúdo não pode estar vazio.', 'error');
            editor.focus();
            return;
        }

        const conteudoId = document.getElementById('conteudo-id').value;
        const isEditing = !!conteudoId;
        // Usa o endpoint /admin para criar ou atualizar
        const url = isEditing ? `/api/conteudo/admin/${conteudoId}` : '/api/conteudo/admin';
        const method = isEditing ? 'PUT' : 'POST';
        const dto = {
            titulo: tituloInput.value,
            tipo: tipoInput.value,
            corpo: corpoConteudo,
            status: 'RASCUNHO' // Médico sempre salva como RASCUNHO
        };

        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Salvando...';
        const errorDiv = document.getElementById('conteudo-error-message');
        errorDiv.style.display = 'none';

        try {
            const response = await fetchAuthenticated(url, { method: method, body: JSON.stringify(dto) });
            if (response && response.ok) {
                showToast(`Rascunho ${isEditing ? 'atualizado' : 'salvo'} com sucesso!`, 'success');
                renderMeusConteudos(); // Volta para a lista
            }
            else { await handleApiError(response, 'conteudo-error-message'); }
        } catch (err) {
            console.error("Erro ao salvar conteúdo:", err);
            showToast('Erro de rede ao salvar conteúdo.', 'error');
            errorDiv.textContent = 'Erro de rede. Verifique sua conexão.';
            errorDiv.style.display = 'block';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Salvar Rascunho';
        }
    }

    // --- Funções de Perfil (Médico) ---
    function renderMeuPerfil() {
        cleanupBeforeRender();
        const contentDinamico = document.getElementById('medico-content-dinamico');
        const usuario = dadosUsuarioAtual; // Usar os dados já carregados

        if (!usuario) {
            contentDinamico.innerHTML = '<p>Erro ao carregar dados do perfil.</p>';
            return;
        }

        const especialidadeFormatada = usuario.especialidade ? usuario.especialidade.replace(/_/g, ' ') : 'N/A';

        contentDinamico.innerHTML = `
        <div class="section-card">
             <div class="admin-section-header">
                <h3>Meu Perfil</h3>
            </div>
            <div id="perfil-info-medico" class="document-item">
                 <p><strong>Nome:</strong> <span id="display-nome-medico">${usuario.nome || 'N/A'}</span> <button class="btn btn-secondary btn-sm" id="btn-editar-nome-medico" style="margin-left: 1rem;">Editar Nome</button></p>
                 <!-- Formulário de Edição de Nome (oculto) -->
                <form id="form-editar-nome-medico" style="display: none; margin-top: 0.5rem; margin-bottom: 1rem; padding: 1rem; background-color: #f8f9fa; border-radius: 0.5rem; border: 1px solid var(--cor-borda);">
                     <div id="nome-edit-error-medico" class="error-message" style="display:none; margin-bottom: 0.5rem;"></div>
                    <div class="input-group" style="margin-bottom: 0.5rem;">
                        <label for="edit-nome-medico" style="margin-bottom: 0.25rem;">Novo Nome</label>
                        <input type="text" id="edit-nome-medico" value="${usuario.nome || ''}" required minlength="3">
                    </div>
                    <div class="form-actions" style="justify-content: flex-start; gap: 0.5rem;">
                        <button type="submit" class="btn btn-success btn-sm">Salvar Nome</button>
                        <button type="button" class="btn btn-secondary btn-sm" id="btn-cancelar-edit-nome-medico">Cancelar</button>
                    </div>
                </form>
                <p><strong>Email:</strong> ${usuario.email || 'N/A'}</p>
                <p><strong>CPF:</strong> ${formatCPF(usuario.cpf) || 'N/A'}</p>
                <p><strong>CRM:</strong> ${usuario.crm || 'N/A'}</p>
                <p><strong>Especialidade:</strong> ${especialidadeFormatada}</p>
                <!-- Poderia adicionar a Unidade de Saúde aqui se necessário -->
            </div>
        </div>

        <!-- Seção de Alterar Senha -->
        <div class="section-card" style="margin-top: 1.5rem;">
            <h4>Alterar Senha</h4>
            <form id="form-alterar-senha-medico">
                <div id="senha-error-message-medico" class="error-message" style="display:none;"></div>
                <div class="input-group">
                    <label for="nova-senha-medico">Nova Senha</label>
                    <input type="password" id="nova-senha-medico" required minlength="6">
                </div>
                 <div class="password-criteria-container" style="margin-top: -0.5rem; margin-bottom: 1rem;">
                    <ul>
                        <li id="length-check-medico">Pelo menos 6 caracteres</li>
                        <li id="number-check-medico">Conter pelo menos um número</li>
                    </ul>
                </div>
                <div class="input-group">
                    <label for="confirma-senha-medico">Confirme a Nova Senha</label>
                    <input type="password" id="confirma-senha-medico" required>
                </div>
                <div class="form-actions" style="justify-content: flex-end;">
                    <button type="submit" class="btn btn-success">Salvar Nova Senha</button>
                </div>
            </form>
        </div>`;

        // Listener para o botão Editar Nome (Médico)
        const btnEditNomeMedico = document.getElementById('btn-editar-nome-medico');
        const formEditNomeMedico = document.getElementById('form-editar-nome-medico');
        const displayNomeMedico = document.getElementById('display-nome-medico');

        btnEditNomeMedico.addEventListener('click', () => {
            formEditNomeMedico.style.display = 'block';
            btnEditNomeMedico.style.display = 'none';
            document.getElementById('edit-nome-medico').focus();
            displayNomeMedico.style.display = 'none';
        });

        document.getElementById('btn-cancelar-edit-nome-medico').addEventListener('click', () => {
            formEditNomeMedico.style.display = 'none';
            btnEditNomeMedico.style.display = 'inline-block';
            document.getElementById('edit-nome-medico').value = dadosUsuarioAtual.nome || ''; // Restaura
            document.getElementById('nome-edit-error-medico').style.display = 'none';
            displayNomeMedico.style.display = 'inline';
        });

        // Listener para salvar o nome (Médico)
        formEditNomeMedico.addEventListener('submit', handleUpdateNomeMedico);


        // Listener e validação para o formulário de alterar senha (Médico)
        document.getElementById('form-alterar-senha-medico').addEventListener('submit', handleUpdatePasswordMedico);

        const novaSenhaInputMedico = document.getElementById('nova-senha-medico');
        const lengthCheckMedico = document.getElementById('length-check-medico');
        const numberCheckMedico = document.getElementById('number-check-medico');

        const validatePasswordMedico = () => {
            const senha = novaSenhaInputMedico.value;
            lengthCheckMedico.classList.toggle('valid', senha.length >= 6);
            numberCheckMedico.classList.toggle('valid', /\d/.test(senha));
        };
        novaSenhaInputMedico.addEventListener('input', validatePasswordMedico);
    }

    // Função para lidar com a atualização do NOME (Médico)
    async function handleUpdateNomeMedico(event) {
        event.preventDefault();
        const nomeInput = document.getElementById('edit-nome-medico');
        const novoNome = nomeInput.value.trim();

        if (!novoNome || novoNome.length < 3) {
            showToast('O nome deve ter pelo menos 3 caracteres.', 'error');
            nomeInput.focus();
            return;
        }
        if (novoNome === dadosUsuarioAtual.nome) {
            showToast('O nome não foi alterado.', 'info');
            document.getElementById('form-editar-nome-medico').style.display = 'none';
            document.getElementById('btn-editar-nome-medico').style.display = 'inline-block';
            document.getElementById('display-nome-medico').style.display = 'inline';
            return;
        }

        const dto = { nome: novoNome }; // Apenas o nome a ser alterado
        const submitButton = event.target.querySelector('button[type="submit"]');
        const errorDiv = document.getElementById('nome-edit-error-medico');
        submitButton.disabled = true;
        submitButton.textContent = 'Salvando...';
        errorDiv.style.display = 'none';

        try {
            // Usa o endpoint PUT /api/usuarios/{id}
            const response = await fetchAuthenticated(`/api/usuarios/${idUsuarioLogado}`, {
                method: 'PUT',
                body: JSON.stringify(dto)
            });

            if (response && response.ok) {
                // A resposta agora contém o perfil completo atualizado
                dadosUsuarioAtual = await response.json();
                showToast('Nome atualizado com sucesso!', 'success');
                // Atualiza o nome na barra de boas-vindas também
                const welcomeMsg = document.getElementById('welcome-message');
                if (welcomeMsg) welcomeMsg.textContent = `Seja bem-vindo(a), Dr(a). ${dadosUsuarioAtual.nome}!`;
                renderMeuPerfil(); // Re-renderiza a seção de perfil
            } else {
                await handleApiError(response, 'nome-edit-error-medico');
            }
        } catch (err) {
            console.error("Erro ao atualizar nome:", err);
            showToast('Erro de rede ao atualizar o nome.', 'error');
            errorDiv.textContent = 'Erro de rede. Verifique sua conexão.';
            errorDiv.style.display = 'block';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Salvar Nome';
        }
    }

    // Função para lidar com a atualização da SENHA (Médico)
    async function handleUpdatePasswordMedico(event) {
        event.preventDefault();
        const novaSenhaInput = document.getElementById('nova-senha-medico');
        const confirmaSenhaInput = document.getElementById('confirma-senha-medico');
        const novaSenha = novaSenhaInput.value;
        const confirmaSenha = confirmaSenhaInput.value;

        if (novaSenha.length < 6 || !/\d/.test(novaSenha)) {
            showToast('A nova senha não atende aos critérios mínimos.', 'error');
            novaSenhaInput.focus();
            return;
        }
        if (novaSenha !== confirmaSenha) {
            showToast('As senhas não coincidem.', 'error');
            confirmaSenhaInput.focus();
            return;
        }

        const dto = { senha: novaSenha }; // Apenas a senha a ser alterada
        const submitButton = event.target.querySelector('button[type="submit"]');
        const errorDiv = document.getElementById('senha-error-message-medico');
        submitButton.disabled = true;
        submitButton.textContent = 'Salvando...';
        errorDiv.style.display = 'none';

        try {
            // Usa o endpoint PUT /api/usuarios/{id}
            const response = await fetchAuthenticated(`/api/usuarios/${idUsuarioLogado}`, {
                method: 'PUT',
                body: JSON.stringify(dto)
            });

            if (response && response.ok) {
                showToast('Senha alterada com sucesso! Você será deslogado por segurança.', 'success');
                setTimeout(logout, 3000);
            } else {
                await handleApiError(response, 'senha-error-message-medico');
                novaSenhaInput.value = '';
                confirmaSenhaInput.value = '';
            }
        } catch (err) {
            console.error("Erro ao alterar senha:", err);
            showToast('Erro de rede ao alterar senha.', 'error');
            errorDiv.textContent = 'Erro de rede. Verifique sua conexão.';
            errorDiv.style.display = 'block';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Salvar Nova Senha';
        }
    }


    // --- Funções de Modal de Preview e Formatação ---
    function openPreviewModal(title, content) {
        const modal = document.getElementById('preview-modal');
        if (modal) {
            document.getElementById('preview-title').textContent = title;
            const previewBody = document.getElementById('preview-body');
            previewBody.innerHTML = ''; // Limpa antes
            previewBody.innerHTML = content;
            modal.style.display = 'flex';
        } else {
            console.error("Elemento modal 'preview-modal' não encontrado.");
            alert("Erro: Modal de visualização não encontrado.");
        }
    }

    function closePreviewModal() {
        const modal = document.getElementById('preview-modal');
        if (modal) modal.style.display = 'none';
        const previewBody = document.getElementById('preview-body');
        if (previewBody) previewBody.innerHTML = ''; // Limpa ao fechar
    }

    // Funções de formatação
    function formatTelefone(value) {
        if (!value) return "";
        value = value.replace(/\D/g, '');
        if (value.length <= 10) {
            value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
            value = value.replace(/(\d{4})(\d)/, "$1-$2");
        } else {
            value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
            value = value.replace(/(\d{5})(\d)/, "$1-$2");
        }
        return value.slice(0, 15);
    }
    function formatCPF(value) {
        if (!value) return "";
        value = value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        return value.slice(0, 14);
    }


    // Inicia a execução do dashboard
    initMedicoDashboard();
});

