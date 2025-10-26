// ===================================================================
// PACIENTE.JS (VERSÃO COMPLETA E ATUALIZADA)
// Inclui o novo sistema de filtros na tela de agendamento e a Central de Ajuda.
// Adiciona endereço da UBS e especialidade do médico nos cards de agendamento.
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    let idUsuarioLogado = null;
    let todosOsMedicos = []; // Armazena a lista completa de médicos

    const DIAS_SEMANA_MAP = { "DOMINGO": 0, "SEGUNDA": 1, "TERCA": 2, "QUARTA": 3, "QUINTA": 4, "SEXTA": 5, "SABADO": 6 };
    const SPINNER_HTML = `<div class="spinner-container"><div class="spinner"></div></div>`;

    function getProximaDataISO(diaDaSemana, horaMinuto) {
        const [hora, minuto] = horaMinuto.split(':').map(Number);
        const agora = new Date();
        const diaDeHoje = agora.getDay();
        const diaAlvoJS = DIAS_SEMANA_MAP[diaDaSemana.toUpperCase()];
        let diasParaAdicionar = diaAlvoJS - diaDeHoje;
        if (diasParaAdicionar < 0 || (diasParaAdicionar === 0 && (agora.getHours() > hora || (agora.getHours() === hora && agora.getMinutes() >= minuto)))) {
            diasParaAdicionar += 7;
        }
        const dataAlvo = new Date(agora);
        dataAlvo.setDate(agora.getDate() + diasParaAdicionar);
        dataAlvo.setHours(hora, minuto, 0, 0);
        const pad = (num) => num.toString().padStart(2, '0');
        const ano = dataAlvo.getFullYear();
        const mes = pad(dataAlvo.getMonth() + 1);
        const dia = pad(dataAlvo.getDate());
        const horaFormatada = pad(dataAlvo.getHours());
        const minutoFormatado = pad(dataAlvo.getMinutes());
        return `${ano}-${mes}-${dia}T${horaFormatada}:${minutoFormatado}:00`;
    }

    async function initPacienteDashboard() {
        try {
            const responseMe = await fetchAuthenticated('/api/usuarios/me');
            if (!responseMe || !responseMe.ok) throw new Error('Falha ao buscar perfil do paciente');
            const pacienteUser = await responseMe.json();
            idUsuarioLogado = pacienteUser.id;
        } catch (e) {
            console.error(e);
            contentArea.innerHTML = "<p>Erro fatal ao carregar dados do paciente. Faça o login novamente.</p>";
            // Adicionado para limpar localStorage e redirecionar em caso de erro fatal
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('userName');
            window.location.href = 'login.html';
            return;
        }

        contentArea.innerHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card" id="card-agendar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                    <span>Novo Agendamento</span>
                </div>
                <div class="dashboard-card" id="card-meus-agendamentos">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>Meus Agendamentos</span>
                </div>
                <div class="dashboard-card" id="card-meu-perfil">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span>Meu Perfil</span>
                </div>
                <div class="dashboard-card" id="card-noticias">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                    <span>Notícias e Artigos</span>
                </div>
                 <div class="dashboard-card" id="card-ajuda">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    <span>Central de Ajuda</span>
                </div>
            </div>
            <hr>
            <div id="paciente-content-dinamico"></div>
        `;

        document.getElementById('card-agendar').addEventListener('click', renderTelaDeAgendamento);
        document.getElementById('card-meus-agendamentos').addEventListener('click', renderMeusAgendamentos);
        document.getElementById('card-meu-perfil').addEventListener('click', renderMeuPerfil);
        document.getElementById('card-noticias').addEventListener('click', () => {
            document.getElementById('paciente-content-dinamico').innerHTML = `<div class="admin-section-header"><h3>Notícias e Artigos</h3></div>`;
            renderNoticiasPublicas('paciente-content-dinamico');
        });
        document.getElementById('card-ajuda').addEventListener('click', renderCentralDeAjuda);

        renderTelaDeAgendamento(); // Inicia na tela de agendamento
    }

    function renderCentralDeAjuda() {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        contentDinamico.innerHTML = `
            <div class="admin-section-header">
                <h3>Central de Ajuda</h3>
            </div>
            <p>Encontre respostas para as perguntas mais comuns sobre o uso do AgendaSUS.</p>
            <div class="faq-container">
                <details>
                    <summary>Como agendo uma nova consulta?</summary>
                    <div class="faq-content">
                        <p><strong>1. Acesse a tela "Novo Agendamento":</strong> Este é o primeiro item que aparece no seu dashboard.</p>
                        <p><strong>2. Filtre e Encontre um Médico:</strong> Você pode buscar médicos pelo nome, especialidade ou pela Unidade de Saúde.</p>
                        <p><strong>3. Veja os Horários:</strong> Clique em "Ver horários &rarr;" no médico desejado.</p>
                        <p><strong>4. Escolha um Horário:</strong> Os horários disponíveis estarão em azul. Clique no que for melhor para você.</p>
                        <p><strong>5. Descreva seus Sintomas:</strong> Preencha o formulário final com seus sintomas e outras informações relevantes e clique em "Confirmar Agendamento".</p>
                    </div>
                </details>
                <details>
                    <summary>Como posso ver meus agendamentos?</summary>
                    <div class="faq-content">
                        <p>Clique no card <strong>"Meus Agendamentos"</strong>. A tela mostrará duas seções:</p>
                        <p><strong>- Próximos Agendamentos:</strong> Suas consultas futuras, com status PENDENTE ou CONFIRMADO.</p>
                        <p><strong>- Histórico de Agendamentos:</strong> Todas as suas consultas passadas (ATENDIDO, CANCELADO, etc.).</p>
                    </div>
                </details>
                 <details>
                    <summary>Como cancelo uma consulta?</summary>
                    <div class="faq-content">
                        <p><strong>1.</strong> Vá para <strong>"Meus Agendamentos"</strong>.</p>
                        <p><strong>2.</strong> Na lista de "Próximos Agendamentos", encontre a consulta que deseja cancelar.</p>
                        <p><strong>3.</strong> Clique no botão vermelho <strong>"Cancelar"</strong> ao lado dela e confirme a ação.</p>
                        <p>Lembre-se: Só é possível cancelar agendamentos com status PENDENTE ou CONFIRMADO.</p>
                    </div>
                </details>
                <details>
                    <summary>Onde encontro minhas prescrições, atestados e exames?</summary>
                    <div class="faq-content">
                        <p><strong>1.</strong> Acesse <strong>"Meus Agendamentos"</strong> e vá para o <strong>"Histórico de Agendamentos"</strong>.</p>
                        <p><strong>2.</strong> Encontre a consulta que foi "ATENDIDA".</p>
                        <p><strong>3.</strong> Clique no botão <strong>"Ver Detalhes"</strong>. Uma nova seção aparecerá na tela com todos os documentos gerados naquela consulta (prescrições, atestados e a lista de exames solicitados).</p>
                    </div>
                </details>
                 <details>
                    <summary>Esqueci minha senha, e agora?</summary>
                    <div class="faq-content">
                        <p><strong>1.</strong> Na tela de login, clique no link <strong>"Esqueci minha senha"</strong>.</p>
                        <p><strong>2.</strong> Informe seu e-mail de cadastro para receber um token de recuperação.</p>
                        <p><strong>3.</strong> Vá para a página de redefinição, cole o token e crie uma nova senha.</p>
                    </div>
                </details>
            </div>
        `;
    }

    async function renderTelaDeAgendamento() {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        contentDinamico.innerHTML = `<div class="section-card"><h3>Novo Agendamento</h3><p>Encontre um profissional para agendar sua consulta.</p><div id="filtros-container"></div><ul id="lista-medicos" class="medico-list" style="margin-top: 1.5rem;">${SPINNER_HTML}</ul></div>`;

        try {
            const response = await fetchAuthenticated('/api/medicos');
            if (!response || !response.ok) throw new Error('Falha ao carregar médicos');
            todosOsMedicos = await response.json();

            renderFiltrosMedicos(); // Renderiza os filtros primeiro
            renderListaMedicos(); // Renderiza a lista inicial (sem filtro)
        } catch (err) {
            console.error(err);
            document.getElementById('lista-medicos').innerHTML = '<li>Erro ao carregar médicos.</li>';
        }
    }

    function renderFiltrosMedicos() {
        const container = document.getElementById('filtros-container');
        if (!container) return;

        // Extrai opções únicas para os filtros
        const especialidades = [...new Set(todosOsMedicos.map(m => m.especialidade).filter(Boolean))].sort();
        const unidades = [...new Set(todosOsMedicos.map(m => m.unidade?.nome).filter(Boolean))].sort(); // Usa ?. para segurança

        let especialidadesOptions = especialidades.map(e => `<option value="${e}">${e.replace(/_/g, ' ')}</option>`).join('');
        let unidadesOptions = unidades.map(u => `<option value="${u}">${u}</option>`).join('');

        container.innerHTML = `
            <div class="filter-bar">
                <div class="filter-group">
                    <label for="filtro-nome">Nome do Médico</label>
                    <input type="text" id="filtro-nome" placeholder="Digite o nome...">
                </div>
                <div class="filter-group">
                    <label for="filtro-especialidade">Especialidade</label>
                    <select id="filtro-especialidade">
                        <option value="">Todas</option>
                        ${especialidadesOptions}
                    </select>
                </div>
                <div class="filter-group">
                    <label for="filtro-unidade">Unidade de Saúde</label>
                    <select id="filtro-unidade">
                        <option value="">Todas</option>
                        ${unidadesOptions}
                    </select>
                </div>
            </div>
        `;

        // Adiciona os listeners para os filtros
        document.getElementById('filtro-nome').addEventListener('input', renderListaMedicos);
        document.getElementById('filtro-especialidade').addEventListener('change', renderListaMedicos);
        document.getElementById('filtro-unidade').addEventListener('change', renderListaMedicos);
    }

    function renderListaMedicos() {
        const listaUL = document.getElementById('lista-medicos');
        listaUL.innerHTML = ''; // Limpa a lista antes de renderizar

        const nomeFiltro = document.getElementById('filtro-nome')?.value.toLowerCase() || '';
        const especialidadeFiltro = document.getElementById('filtro-especialidade')?.value || '';
        const unidadeFiltro = document.getElementById('filtro-unidade')?.value || '';

        const medicosFiltrados = todosOsMedicos.filter(medico => {
            if (!medico.ativo) return false; // Ignora médicos inativos

            const matchNome = medico.nome.toLowerCase().includes(nomeFiltro);
            const matchEspecialidade = !especialidadeFiltro || medico.especialidade === especialidadeFiltro;
            const matchUnidade = !unidadeFiltro || medico.unidade?.nome === unidadeFiltro; // Usa ?. para segurança

            return matchNome && matchEspecialidade && matchUnidade;
        });

        if (medicosFiltrados.length === 0) {
            listaUL.innerHTML = '<li>Nenhum médico encontrado com os filtros selecionados.</li>';
            return;
        }

        medicosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome)); // Ordena por nome

        medicosFiltrados.forEach(medico => {
            const li = document.createElement('li');
            li.className = 'medico-item-clicavel';
            // Inclui o nome da unidade aqui
            li.innerHTML = `<div><strong>Dr(a). ${medico.nome}</strong><br><small>${medico.especialidade.replace(/_/g, ' ')} | ${medico.unidade ? medico.unidade.nome : 'Unidade N/A'}</small></div><span>Ver horários &rarr;</span>`;
            li.addEventListener('click', () => renderDetalhesMedicoParaAgendamento(medico.id));
            listaUL.appendChild(li);
        });
    }

    async function renderMeuPerfil() {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        contentDinamico.innerHTML = `<div class="section-card"><h3>Meu Perfil</h3><div id="perfil-info">${SPINNER_HTML}</div></div><div class="section-card" style="margin-top: 1.5rem;"><h4>Alterar Senha</h4><form id="form-alterar-senha"><div id="senha-error-message" class="error-message" style="display:none;"></div><div class="input-group"><label>Nova Senha</label><input type="password" id="nova-senha" required minlength="6"></div><div class="input-group"><label>Confirme</label><input type="password" id="confirma-senha" required></div><div class="form-actions"><button type="submit" class="btn btn-success">Salvar Nova Senha</button></div></form></div>`;
        try {
            const response = await fetchAuthenticated('/api/usuarios/me');
            if (!response || !response.ok) throw new Error('Falha ao buscar perfil.');
            const usuario = await response.json();
            // Tenta buscar dados específicos do paciente (opcional, pode vir do /me se ajustado no backend)
            // const respPaciente = await fetchAuthenticated(`/api/pacientes/${usuario.id}`); // Exemplo
            // if(respPaciente && respPaciente.ok) { const pacienteData = await respPaciente.json(); /* usar dados extras */ }

            document.getElementById('perfil-info').innerHTML = `<p><strong>Nome:</strong> ${usuario.nome}</p><p><strong>Email:</strong> ${usuario.email}</p><p><strong>CPF:</strong> ${usuario.cpf}</p>`; // Adicionar mais dados se disponíveis
        } catch (err) { document.getElementById('perfil-info').innerHTML = '<p>Erro ao carregar seu perfil.</p>'; }
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

        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Salvando...';

        const dto = { senha: novaSenha };
        try {
            const response = await fetchAuthenticated(`/api/usuarios/${idUsuarioLogado}`, { method: 'PUT', body: JSON.stringify(dto) });
            if (response && response.ok) {
                showToast('Senha alterada! Você será deslogado.', 'success');
                setTimeout(logout, 2000);
            } else { await handleApiError(response, 'senha-error-message'); }
        } catch (err) { showToast('Erro de rede ao alterar senha.', 'error'); }
        finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Salvar Nova Senha';
        }
    }

    async function renderDetalhesMedicoParaAgendamento(medicoId) {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        contentDinamico.innerHTML = `<div class="section-card">${SPINNER_HTML}</div>`;
        try {
            const [respMedico, respHorarios, respHorariosOcupados] = await Promise.all([
                fetchAuthenticated(`/api/medicos/${medicoId}`),
                fetchAuthenticated(`/api/medicos/${medicoId}/horarios`),
                fetchAuthenticated(`/api/agendamentos/medico/${medicoId}/horarios-ocupados`) // Endpoint seguro
            ]);
            if (!respMedico || !respMedico.ok || !respHorarios || !respHorarios.ok || !respHorariosOcupados || !respHorariosOcupados.ok) {
                throw new Error('Não foi possível carregar os dados completos do médico.');
            }

            const medico = await respMedico.json();
            const agenda = await respHorarios.json();
            const horariosOcupadosISO = await respHorariosOcupados.json(); // Lista de strings ISO
            const horariosAgendados = new Set(horariosOcupadosISO); // Usa Set para busca rápida

            let htmlAgenda = `<div class="section-card">
                                <h3>Agenda de ${medico.nome} (${medico.especialidade.replace(/_/g, ' ')})</h3>
                                <p><strong>Unidade:</strong> ${medico.unidade ? medico.unidade.nome : 'N/A'}</p>
                                <button class="btn btn-secondary" id="btn-voltar-lista" style="margin-bottom: 1rem;">&larr; Voltar para Lista</button>`;

            if (!agenda.dias || agenda.dias.length === 0) {
                htmlAgenda += '<p style="margin-top: 1rem;">Este médico não possui horários disponíveis cadastrados.</p>';
            } else {
                htmlAgenda += '<p style="margin-top: 1rem;">Selecione um horário para agendar:</p>';
                // Ordena os dias da semana corretamente
                const diasOrdenados = agenda.dias.sort((a, b) => DIAS_SEMANA_MAP[a.dia.toUpperCase()] - DIAS_SEMANA_MAP[b.dia.toUpperCase()]);

                diasOrdenados.forEach(dia => {
                    htmlAgenda += `<div class="dia-agenda"><strong>${dia.dia.charAt(0) + dia.dia.slice(1).toLowerCase()}</strong><div class="horarios-grid">`;
                    // Ordena os horários dentro do dia
                    const horariosOrdenados = dia.horarios.sort();
                    horariosOrdenados.forEach(hora => {
                        const dataSlotISO = getProximaDataISO(dia.dia, hora);
                        const isAgendado = horariosAgendados.has(dataSlotISO);

                        htmlAgenda += `<button class="btn-horario ${isAgendado ? 'indisponivel' : ''}" data-iso-datetime="${dataSlotISO}" data-medico-id="${medico.id}" data-medico-nome="${medico.nome}" ${isAgendado ? 'disabled title="Horário já agendado"' : ''}>${hora}</button>`;
                    });
                    htmlAgenda += `</div></div>`;
                });
            }
            htmlAgenda += `</div>`; // Fecha section-card
            contentDinamico.innerHTML = htmlAgenda;
            document.getElementById('btn-voltar-lista').addEventListener('click', renderTelaDeAgendamento);
            document.querySelectorAll('.btn-horario:not(.indisponivel)').forEach(button => {
                button.addEventListener('click', () => renderFormularioSintomas(button.dataset.isoDatetime, button.dataset.medicoId, button.dataset.medicoNome));
            });
        } catch (err) {
            console.error(err);
            contentDinamico.innerHTML = `<div class="section-card"><p>Erro ao carregar agenda. <button class="btn btn-secondary" id="btn-voltar-lista">Voltar</button></p></div>`;
            document.getElementById('btn-voltar-lista').addEventListener('click', renderTelaDeAgendamento);
        }
    }

    function renderFormularioSintomas(dataISO, medicoId, nomeMedico) {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        const dataFormatada = new Date(dataISO).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' });
        contentDinamico.innerHTML = `<div class="booking-form-container"><h4>Confirmar Agendamento</h4><p>Médico: <strong>${nomeMedico}</strong><br>Horário: <strong style="font-size: 1.1rem;">${dataFormatada}</strong></p><form id="form-agendamento-final" style="margin-top: 1.5rem;"><div id="booking-error-message" class="error-message" style="display:none;"></div><div class="input-group"><label for="sintomas">Sintomas (obrigatório)</label><textarea id="sintomas" required rows="4"></textarea></div><div class="input-group"><label for="diasSintomas">Está com sintomas há quantos dias?</label><input type="number" id="diasSintomas" min="0"></div><div class="input-group"><label for="alergias">Alergias (Opcional)</label><input type="text" id="alergias"></div><div class="input-group"><label for="cirurgias">Cirurgias prévias (Opcional)</label><input type="text" id="cirurgias"></div><div class="form-actions"><button type="submit" class="btn btn-success">Confirmar Agendamento</button><button type="button" class="btn btn-secondary" id="btn-cancelar">Voltar</button></div></form></div>`;
        document.getElementById('btn-cancelar').addEventListener('click', () => renderDetalhesMedicoParaAgendamento(medicoId));
        document.getElementById('form-agendamento-final').addEventListener('submit', (e) => handleBookingSubmit(e, dataISO, medicoId));
    }

    async function handleBookingSubmit(event, dataISO, medicoId) {
        event.preventDefault();
        const sintomasInput = document.getElementById('sintomas');
        if (!sintomasInput.value || sintomasInput.value.trim() === '') {
            showToast('Por favor, descreva seus sintomas. Este campo é obrigatório.', 'error');
            sintomasInput.focus();
            return;
        }

        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Agendando...';

        const diasSintomasValue = document.getElementById('diasSintomas').value;
        const agendamentoDTO = {
            idMedico: parseInt(medicoId),
            dataHora: dataISO,
            sintomas: sintomasInput.value,
            diasSintomas: diasSintomasValue ? parseInt(diasSintomasValue, 10) : null,
            alergias: document.getElementById('alergias').value,
            cirurgias: document.getElementById('cirurgias').value
        };

        try {
            const response = await fetchAuthenticated('/api/agendamentos', { method: 'POST', body: JSON.stringify(agendamentoDTO) });
            if (response && response.ok) {
                showToast('Agendamento realizado com sucesso!', 'success');
                renderMeusAgendamentos(); // Vai para a tela de "Meus Agendamentos"
            } else if (response) {
                await handleApiError(response, 'booking-error-message');
            }
        } catch (err) {
            showToast('Erro de rede ao agendar.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Confirmar Agendamento';
        }
    }

    function showConfirmationModal(message, onConfirm) {
        const modal = document.getElementById('confirmation-modal');
        const messageP = document.getElementById('modal-message');
        const btnConfirm = document.getElementById('modal-btn-confirm');
        const btnCancel = document.getElementById('modal-btn-cancel');

        if (!modal || !messageP || !btnConfirm || !btnCancel) {
            console.error("Elementos do modal de confirmação não encontrados no HTML.");
            if (confirm(message)) { onConfirm(); } // Fallback para confirm nativo
            return;
        }

        messageP.textContent = message;
        modal.style.display = 'flex';

        // Usa AbortController para remover listeners antigos e evitar múltiplos cliques
        const controller = new AbortController();
        const cleanup = () => {
            modal.style.display = 'none';
            controller.abort(); // Remove os listeners associados a este controller
        };

        btnConfirm.addEventListener('click', () => { onConfirm(); cleanup(); }, { signal: controller.signal });
        btnCancel.addEventListener('click', cleanup, { signal: controller.signal });
        modal.addEventListener('click', (e) => { if (e.target === modal) cleanup(); }, { signal: controller.signal });
    }

    async function renderMeusAgendamentos() {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        contentDinamico.innerHTML = `<div class="section-card"><h3>Meus Agendamentos</h3><div id="agendamentos-container">${SPINNER_HTML}</div></div><div id="detalhes-consulta-container" style="margin-top: 2rem;"></div>`;
        try {
            const response = await fetchAuthenticated('/api/agendamentos/meus');
            if (!response || !response.ok) throw new Error('Falha ao buscar agendamentos');
            const agendamentos = await response.json();
            const proximosAgendamentos = agendamentos.filter(ag => ag.status === 'PENDENTE' || ag.status === 'CONFIRMADO');
            const historicoAgendamentos = agendamentos.filter(ag => ag.status !== 'PENDENTE' && ag.status !== 'CONFIRMADO');

            proximosAgendamentos.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
            historicoAgendamentos.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

            let html = '<h4>Próximos Agendamentos</h4>';
            if (proximosAgendamentos.length === 0) {
                html += '<p>Nenhum próximo agendamento encontrado.</p>';
            } else {
                html += '<ul class="medico-list">';
                proximosAgendamentos.forEach(ag => {
                    const especialidadeFormatada = ag.medico.especialidade ? ag.medico.especialidade.replace(/_/g, ' ') : 'N/A';
                    const unidadeNome = ag.medico.nomeUnidade || 'Unidade não informada';
                    const unidadeEndereco = ag.medico.enderecoUnidade || 'Endereço não informado';

                    html += `
                    <li class="agendamento-card status-${ag.status}">
                        <div>
                            <strong>${new Date(ag.dataHora).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}</strong><br>
                            <small>
                                Médico(a): ${ag.medico.nome} (${especialidadeFormatada})<br>
                                Local: ${unidadeNome} - ${unidadeEndereco}<br>
                                Status: <span class="badge status-${ag.status}">${ag.status}</span>
                            </small>
                        </div>
                        <button class="btn btn-danger btn-sm btn-cancelar-agendamento" data-id="${ag.id}" title="Cancelar Agendamento">Cancelar</button>
                    </li>`;
                });
                html += '</ul>';
            }

            html += '<hr style="margin: 2.5rem 0;"><h4>Histórico de Agendamentos</h4>'; // Aumenta margem do hr
            if (historicoAgendamentos.length === 0) {
                html += '<p>Nenhum agendamento no seu histórico.</p>';
            } else {
                html += '<div class="history-grid">';
                historicoAgendamentos.forEach(ag => {
                    const especialidadeFormatada = ag.medico.especialidade ? ag.medico.especialidade.replace(/_/g, ' ') : 'N/A';
                    const unidadeNome = ag.medico.nomeUnidade || 'Unidade não informada';

                    html += `
                    <div class="history-card status-${ag.status}">
                        <div class="history-card-header">
                            <strong>${new Date(ag.dataHora).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</strong><br>
                            <small>Médico(a): ${ag.medico.nome} (${especialidadeFormatada})<br>
                                   Local: ${unidadeNome}
                            </small>
                        </div>
                         <div class="history-card-footer">
                            <span class="badge status-${ag.status}">${ag.status.replace(/_/g, ' ')}</span>
                            ${ag.status === 'ATENDIDO' ? `<button class="btn btn-secondary btn-sm" onclick="handleVerDetalhesConsulta(${ag.id})">Ver Detalhes</button>` : ''}
                        </div>
                    </div>`;
                });
                html += '</div>';
            }
            document.getElementById('agendamentos-container').innerHTML = html;
            document.querySelectorAll('.btn-cancelar-agendamento').forEach(btn => btn.addEventListener('click', () => handleCancelarAgendamento(btn.dataset.id, btn))); // Passa o botão
        } catch (err) {
            console.error(err);
            contentDinamico.innerHTML = '<p>Erro ao carregar seus agendamentos.</p>';
        }
    }

    async function handleCancelarAgendamento(agendamentoId, buttonElement) {
        showConfirmationModal('Tem certeza que deseja cancelar este agendamento?', async () => {
            try {
                if (buttonElement) { // Desabilita o botão clicado
                    buttonElement.disabled = true;
                    buttonElement.textContent = 'Cancelando...';
                }
                const response = await fetchAuthenticated(`/api/agendamentos/${agendamentoId}/cancelar`, { method: 'PUT' });
                if (response && response.ok) {
                    showToast('Agendamento cancelado!', 'success');
                    await renderMeusAgendamentos(); // Recarrega a lista
                } else if (response) {
                    await handleApiError(response, null);
                    if (buttonElement) { // Reabilita em caso de erro da API
                        buttonElement.disabled = false;
                        buttonElement.textContent = 'Cancelar';
                    }
                }
            } catch (err) {
                console.error("Erro ao cancelar agendamento:", err);
                showToast('Erro de rede ao cancelar.', 'error');
                if (buttonElement) { // Reabilita em caso de erro de rede
                    buttonElement.disabled = false;
                    buttonElement.textContent = 'Cancelar';
                }
            }
        });
    }

    // Torna a função global para ser chamada pelo onclick no HTML
    window.handleVerDetalhesConsulta = async (agendamentoId) => {
        const container = document.getElementById('detalhes-consulta-container');
        container.innerHTML = `<div class="document-view"><h4>${SPINNER_HTML}</h4></div>`;
        container.scrollIntoView({ behavior: 'smooth' }); // Rola para a área de detalhes

        try {
            // Busca todos os detalhes em paralelo
            const [respPresc, respAtest, respExames] = await Promise.all([
                fetchAuthenticated(`/api/prescricoes/agendamento/${agendamentoId}`),
                fetchAuthenticated(`/api/atestados/agendamento/${agendamentoId}`),
                fetchAuthenticated(`/api/exames/agendamento/${agendamentoId}`)
            ]);

            // Trata as respostas individualmente, permitindo que algumas falhem sem quebrar tudo
            const prescricao = (respPresc && respPresc.ok) ? await respPresc.json().catch(() => null) : null;
            const atestado = (respAtest && respAtest.ok) ? await respAtest.json().catch(() => null) : null;
            const exames = (respExames && respExames.ok) ? await respExames.json().catch(() => []) : [];

            let detailsHtml = `
                <div class="document-view">
                    <div class="admin-section-header">
                        <h4>Detalhes da Consulta</h4>
                        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('detalhes-consulta-container').innerHTML = ''">Fechar Detalhes</button>
                    </div>`;

            if (prescricao) {
                detailsHtml += `<div class="document-section"><h5>Prescrição Médica</h5><pre>${prescricao.medicamentos}</pre></div>`;
            }
            if (atestado) {
                detailsHtml += `<div class="document-section"><h5>Atestado</h5><pre>${atestado.descricao}</pre></div>`;
            }
            if (exames.length > 0) {
                detailsHtml += `<div class="document-section"><h5>Exames Solicitados</h5><ul>`;
                exames.forEach(ex => {
                    detailsHtml += `<li><strong>${ex.tipo}</strong>: ${ex.resultado || 'Aguardando resultado'}</li>`;
                });
                detailsHtml += `</ul></div>`;
            }
            // Mensagem se nenhum documento foi encontrado
            if (!prescricao && !atestado && exames.length === 0) {
                detailsHtml += '<p>Nenhum documento (prescrição, atestado ou exame) foi gerado para esta consulta.</p>';
            }
            detailsHtml += '</div>'; // Fecha document-view

            container.innerHTML = detailsHtml;

        } catch (err) {
            console.error('Erro ao montar detalhes da consulta:', err);
            showToast('Erro ao carregar detalhes da consulta.', 'error');
            container.innerHTML = '<div class="document-view"><p>Erro ao carregar detalhes.</p><button class="btn btn-secondary btn-sm" onclick="document.getElementById(\'detalhes-consulta-container\').innerHTML = \'\'">Fechar</button></div>';
        }
    }

    initPacienteDashboard();
});
