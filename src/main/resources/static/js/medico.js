document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    let meuIdDeMedico = null;
    const DIAS_DA_SEMANA = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO"];
    const LISTA_EXAMES_COMUNS = ["Hemograma Completo", "Colesterol Total e Frações", "Glicemia de Jejum", "Ureia e Creatinina", "Exame de Urina (EAS)", "Eletrocardiograma (ECG)", "Raio-X do Tórax", "Ultrassonografia Abdominal"];

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
        contentDinamico.innerHTML = `<h3>Minha Agenda (Próximas Consultas)</h3><p>Clique em uma consulta para iniciar o atendimento.</p><ul id="lista-agendamentos-medico" class="medico-list"><li>Carregando...</li></ul>`;
        try {
            const response = await fetchAuthenticated('/api/agendamentos/meus');
            if (!response) return;
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
                li.className = 'agendamento-card status-' + ag.status;
                li.style.cursor = 'pointer';
                li.innerHTML = `<div><strong>${new Date(ag.dataHora).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}</strong><br><small>Paciente: ${ag.paciente.nome} | Status: ${ag.status}</small></div><span>Iniciar Atendimento &rarr;</span>`;
                listaUL.appendChild(li);
                li.addEventListener('click', () => renderTelaDeAtendimento(ag.idAgendamento));
            });
        } catch (err) { console.error(err); contentDinamico.innerHTML = '<li>Erro ao carregar agendamentos.</li>'; }
    }

    async function renderHistoricoDeAtendimentos() {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<h3>Histórico de Atendimentos</h3><p>Clique em um atendimento para rever o prontuário.</p><ul id="lista-historico-medico" class="medico-list"><li>Carregando...</li></ul>`;
        try {
            const response = await fetchAuthenticated('/api/agendamentos/meus');
            if (!response) return;
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
                li.className = 'agendamento-card status-' + ag.status;
                li.style.cursor = 'pointer';
                li.innerHTML = `<div><strong>${new Date(ag.dataHora).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}</strong><br><small>Paciente: ${ag.paciente.nome} | Status: ${ag.status}</small></div><span>Ver Prontuário &rarr;</span>`;
                listaUL.appendChild(li);
                li.addEventListener('click', () => renderTelaDeAtendimento(ag.idAgendamento, true));
            });
        } catch (err) { console.error(err); contentDinamico.innerHTML = '<li>Erro ao carregar histórico.</li>'; }
    }

    async function renderTelaDeAtendimento(agendamentoId, isHistorico = false) {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<div>Carregando atendimento...</div>`;
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
                    prescricaoHtml += `<pre class="content">${consulta.prescricao}</pre>`;
                } else { prescricaoHtml += '<p>Nenhuma prescrição gerada para esta consulta.</p>'; }

                contentDinamico.innerHTML = `
                    <div class="admin-section-header"><h3>Prontuário do Atendimento</h3><button class="btn btn-secondary" id="btn-voltar-historico">&larr; Voltar ao Histórico</button></div>
                    <div class="document-item"><p><strong>Paciente:</strong> ${prontuario.nome}</p><p><strong>Data:</strong> ${new Date(consulta.data).toLocaleString('pt-BR')}</p></div><hr>
                    <div class="document-item" style="background-color: #fffaf0;"><div class="ficha-detalhe"><strong>Sintomas Relatados:</strong><p>${consulta.sintomas || 'N/A'}</p></div><div class="ficha-detalhe"><strong>Evolução Médica:</strong><p>${consulta.evolucaoMedica || 'Nenhuma evolução registrada.'}</p></div></div><hr>
                    <div class="document-item">${prescricaoHtml}</div><hr><div class="document-item">${examesHtml}</div>`;
                document.getElementById('btn-voltar-historico').addEventListener('click', renderHistoricoDeAtendimentos);
            } else {
                let examesCheckboxesHtml = '';
                LISTA_EXAMES_COMUNS.forEach(exame => { examesCheckboxesHtml += `<div class="checkbox-group"><input type="checkbox" id="exame-${exame.replace(/\s+/g, '-')}" name="exames" value="${exame}"><label for="exame-${exame.replace(/\s+/g, '-')}">${exame}</label></div>`; });

                contentDinamico.innerHTML = `
                    <div class="admin-section-header"><h3>Atendimento em Andamento</h3><button class="btn btn-secondary" id="btn-voltar-agenda">&larr; Voltar para Agenda</button></div>
                    <div class="document-item"><p><strong>Paciente:</strong> ${prontuario.nome} (${prontuario.idade} anos)</p><p><strong>Queixa Principal:</strong> ${consulta.sintomas}</p></div>
                    <form id="form-finalizar-consulta" class="booking-form-container">
                        <div class="input-group"><label for="evolucao">Evolução Médica</label><textarea id="evolucao" rows="8"></textarea></div>
                        <div class="input-group"><label for="prescricao">Prescrição Médica</label><textarea id="prescricao" rows="8"></textarea></div>
                        <div class="input-group"><label>Solicitação de Exames</label><div class="checkbox-container">${examesCheckboxesHtml}</div></div>
                        <div class="input-group"><label>Necessita de Atestado?</label><div class="radio-group"><input type="radio" id="atestado-nao" name="necessitaAtestado" value="nao" checked> <label for="atestado-nao">Não</label><input type="radio" id="atestado-sim" name="necessitaAtestado" value="sim" style="margin-left: 1rem;"> <label for="atestado-sim">Sim</label></div></div>
                        <div id="atestado-dias-container" class="input-group" style="display: none;"><label for="dias-repouso">Dias de Repouso</label><input type="number" id="dias-repouso" min="1" placeholder="Informe o número de dias"></div>
                        <div class="form-actions"><button type="submit" class="btn btn-success">Finalizar e Salvar Consulta</button></div>
                    </form>`;

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
            if (response.ok) {
                showToast('Consulta finalizada com sucesso!', 'success');
                renderHistoricoDeAtendimentos();
            } else {
                await handleApiError(response, 'atendimento-error-message');
            }
        } catch (err) {
            showToast('Erro de rede ao finalizar a consulta.', 'error');
        }
    }

    async function renderGerenciarHorarios() {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        let htmlForm = `<h3>Meus Horários Disponíveis</h3><p>Adicione ou remova horários.</p><div id="horarios-error-message" class="error-message" style="display:none;"></div><div class="schedule-builder">`;
        DIAS_DA_SEMANA.forEach(dia => { htmlForm += `<div class="schedule-day-card" id="card-${dia}"><h5>${dia.charAt(0) + dia.slice(1).toLowerCase()}</h5><div class="add-time-form"><input type="time" class="time-input" data-dia="${dia}"><button type="button" class="btn-add-time" data-dia="${dia}">+</button></div><div class="time-tags-container" id="tags-${dia}"></div></div>`; });
        htmlForm += `</div><div class="form-actions" style="margin-top: 1.5rem;"><button type="button" class="btn btn-success" id="btn-salvar-agenda">Salvar Agenda</button></div>`;
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

    function renderFormularioConteudo() {
        const contentDinamico = document.getElementById('medico-content-dinamico');
        contentDinamico.innerHTML = `<div class="booking-form-container"><h4>Criar Conteúdo</h4><p>Será salvo como rascunho para aprovação.</p><form id="form-conteudo"><div class="input-group"><label>Título</label><input type="text" id="conteudo-titulo" required></div><div class="input-group"><label>Tipo</label><select id="conteudo-tipo" required><option value="NOTICIA">Notícia</option><option value="ARTIGO">Artigo</option><option value="OUTRO">Outro</option></select></div><div class="input-group"><label>Corpo</label><textarea id="conteudo-corpo" rows="15" required></textarea></div><div class="form-actions"><button type="submit" class="btn btn-primary">Enviar para Aprovação</button></div></form></div>`;
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
        contentDinamico.innerHTML = `<h3>Meu Perfil</h3><div id="perfil-info" class="document-item">Carregando...</div><hr><h4>Alterar Senha</h4><div class="booking-form-container"><form id="form-alterar-senha"><div class="input-group"><label>Nova Senha</label><input type="password" id="nova-senha" required minlength="6"></div><div class="input-group"><label>Confirme</label><input type="password" id="confirma-senha" required></div><div class="form-actions"><button type="submit" class="btn btn-success">Salvar Nova Senha</button></div></form></div>`;
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