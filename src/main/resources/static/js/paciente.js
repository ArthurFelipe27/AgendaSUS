// ===================================================================
// PACIENTE.JS (VERSÃO FINAL E COMPLETA - COM "MEU PERFIL")
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    let idUsuarioLogado = null; // Armazena o ID do paciente logado

    // --- Funções e Constantes de Helper ---
    const DIAS_SEMANA_MAP = {
        "DOMINGO": 0, "SEGUNDA": 1, "TERCA": 2, "QUARTA": 3, "QUINTA": 4, "SEXTA": 5, "SABADO": 6
    };

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
        const offset = dataAlvo.getTimezoneOffset();
        const dataLocalSemTZ = new Date(dataAlvo.getTime() - (offset * 60 * 1000));
        return dataLocalSemTZ.toISOString().slice(0, 19);
    }

    // --- FUNÇÃO DE INICIALIZAÇÃO E ROTEAMENTO ---

    async function initPacienteDashboard() {
        try {
            const responseMe = await fetchAuthenticated('/api/usuarios/me');
            if (!responseMe.ok) throw new Error('Falha ao buscar perfil do paciente');
            const pacienteUser = await responseMe.json();
            idUsuarioLogado = pacienteUser.id;
        } catch (e) {
            console.error(e);
            contentArea.innerHTML = "<p>Erro fatal ao carregar dados do paciente.</p>";
            return;
        }

        contentArea.innerHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card" id="card-agendar">Novo Agendamento</div>
                <div class="dashboard-card" id="card-meus-agendamentos">Meus Agendamentos</div>
                <div class="dashboard-card" id="card-meu-perfil">Meu Perfil</div>
                <div class="dashboard-card" id="card-prescricoes">Minhas Prescrições</div>
                <div class="dashboard-card" id="card-atestados">Meus Atestados</div>
                <div class="dashboard-card" id="card-exames">Meus Exames</div>
                <div class="dashboard-card" id="card-noticias">Notícias e Artigos</div>
            </div>
            <hr>
            <div id="paciente-content-dinamico"></div>
        `;

        document.getElementById('card-agendar').addEventListener('click', renderListaMedicos);
        document.getElementById('card-meus-agendamentos').addEventListener('click', renderMeusAgendamentos);
        document.getElementById('card-meu-perfil').addEventListener('click', renderMeuPerfil);
        document.getElementById('card-prescricoes').addEventListener('click', renderMinhasPrescricoes);
        document.getElementById('card-atestados').addEventListener('click', renderMeusAtestados);
        document.getElementById('card-exames').addEventListener('click', renderMeusExames);
        document.getElementById('card-noticias').addEventListener('click', () => renderNoticiasPublicas('paciente-content-dinamico'));

        renderListaMedicos();
    }

    // --- SEÇÃO 1: "MEU PERFIL" ---

    async function renderMeuPerfil() {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        contentDinamico.innerHTML = `<h3>Meu Perfil</h3><div id="perfil-info" class="document-item">Carregando...</div><hr><h4>Alterar Senha</h4><div class="booking-form-container"><form id="form-alterar-senha"><div id="senha-error-message" class="error-message" style="display:none;"></div><div class="input-group"><label for="nova-senha">Nova Senha</label><input type="password" id="nova-senha" required minlength="6"></div><div class="input-group"><label for="confirma-senha">Confirme</label><input type="password" id="confirma-senha" required></div><div class="form-actions"><button type="submit" class="btn-confirm">Salvar</button></div></form></div>`;

        try {
            const response = await fetchAuthenticated('/api/usuarios/me');
            if (!response.ok) throw new Error('Falha ao buscar perfil.');
            const usuario = await response.json();
            document.getElementById('perfil-info').innerHTML = `<p><strong>Nome:</strong> ${usuario.nome}</p><p><strong>Email:</strong> ${usuario.email}</p><p><strong>CPF:</strong> ${usuario.cpf}</p>`;
        } catch (err) {
            document.getElementById('perfil-info').innerHTML = '<p>Erro ao carregar seu perfil.</p>';
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
            const response = await fetchAuthenticated(`/api/usuarios/${idUsuarioLogado}`, { method: 'PUT', body: JSON.stringify(dto) });
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


    // --- SEÇÃO 2: FLUXO DE NOVO AGENDAMENTO ---

    async function renderListaMedicos() {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        contentDinamico.innerHTML = `<h3>Novo Agendamento</h3><p>Selecione um profissional.</p><ul id="lista-medicos" class="medico-list"><li>Carregando...</li></ul>`;
        try {
            const response = await fetchAuthenticated('/api/medicos');
            if (!response.ok) throw new Error('Falha ao carregar médicos');
            const medicos = await response.json();
            const listaUL = document.getElementById('lista-medicos');
            listaUL.innerHTML = '';
            if (medicos.length === 0) {
                listaUL.innerHTML = '<li>Nenhum médico cadastrado.</li>';
                return;
            }
            medicos.forEach(medico => {
                if (medico.ativo) {
                    const li = document.createElement('li');
                    li.className = 'medico-item-clicavel';
                    li.innerHTML = `<div><strong>Dr(a). ${medico.nome}</strong><br><small>Especialidade: ${medico.especialidade}</small></div><span>Ver horários &rarr;</span>`;
                    li.addEventListener('click', () => renderDetalhesMedicoParaAgendamento(medico.id));
                    listaUL.appendChild(li);
                }
            });
        } catch (err) {
            console.error(err);
            contentDinamico.innerHTML = '<li>Erro ao carregar médicos.</li>';
        }
    }

    async function renderDetalhesMedicoParaAgendamento(medicoId) {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        contentDinamico.innerHTML = `<ul class="medico-list"><li>Carregando agenda...</li></ul>`;
        try {
            const [respMedico, respHorarios] = await Promise.all([
                fetchAuthenticated(`/api/medicos/${medicoId}`),
                fetchAuthenticated(`/api/medicos/${medicoId}/horarios`)
            ]);
            if (!respMedico.ok || !respHorarios.ok) throw new Error('Não foi possível carregar os dados.');
            const medico = await respMedico.json();
            const agenda = await respHorarios.json();
            let htmlAgenda = `<h3>Agenda de ${medico.nome} (${medico.especialidade})</h3><button class="btn-cancel" id="btn-voltar-lista" style="margin-bottom: 1rem;">&larr; Voltar</button>`;
            if (!agenda.dias || agenda.dias.length === 0) {
                htmlAgenda += '<p>Este médico não cadastrou horários.</p>';
            } else {
                htmlAgenda += '<p>Selecione um horário:</p>';
                agenda.dias.forEach(dia => {
                    htmlAgenda += `<div class="dia-agenda"><strong>${dia.dia}</strong><div class="horarios-grid">`;
                    dia.horarios.forEach(hora => {
                        const dataSlotISO = getProximaDataISO(dia.dia, hora);
                        htmlAgenda += `<button class="btn-horario" data-iso-datetime="${dataSlotISO}" data-medico-id="${medico.id}" data-medico-nome="${medico.nome}">${hora}</button>`;
                    });
                    htmlAgenda += `</div></div>`;
                });
            }
            contentDinamico.innerHTML = htmlAgenda;
            document.getElementById('btn-voltar-lista').addEventListener('click', renderListaMedicos);
            document.querySelectorAll('.btn-horario').forEach(button => {
                button.addEventListener('click', () => renderFormularioSintomas(button.dataset.isoDatetime, button.dataset.medicoId, button.dataset.medicoNome));
            });
        } catch (err) {
            console.error(err);
            contentDinamico.innerHTML = '<p>Erro ao carregar agenda. <button id="btn-voltar-lista" class="btn-cancel">Voltar</button></p>';
            document.getElementById('btn-voltar-lista').addEventListener('click', renderListaMedicos);
        }
    }

    function renderFormularioSintomas(dataISO, medicoId, nomeMedico) {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        const dataFormatada = new Date(dataISO).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' });
        contentDinamico.innerHTML = `<div class="booking-form-container"><h4>Confirmar Agendamento</h4><p>Médico: <strong>${nomeMedico}</strong> | Horário: <strong style="font-size: 1.2rem;">${dataFormatada}</strong></p><form id="form-agendamento-final" style="margin-top: 1.5rem;"><div id="booking-error-message" class="error-message" style="display:none;"></div><div class="input-group"><label>Sintomas</label><textarea id="sintomas" required></textarea></div><div class="input-group"><label>Dias com sintomas?</label><input type="number" id="diasSintomas" min="0"></div><div class="input-group"><label>Alergias</label><input type="text" id="alergias"></div><div class="input-group"><label>Cirurgias</label><input type="text" id="cirurgias"></div><div class="form-actions"><button type="submit" class="btn-confirm">Confirmar</button><button type="button" class="btn-cancel" id="btn-cancelar">Voltar</button></div></form></div>`;
        document.getElementById('btn-cancelar').addEventListener('click', () => renderDetalhesMedicoParaAgendamento(medicoId));
        document.getElementById('form-agendamento-final').addEventListener('submit', (e) => handleBookingSubmit(e, dataISO, medicoId));
    }

    async function handleBookingSubmit(event, dataISO, medicoId) {
        event.preventDefault();
        const agendamentoDTO = {
            idMedico: parseInt(medicoId), dataHora: dataISO.replace('T', ' '),
            sintomas: document.getElementById('sintomas').value,
            diasSintomas: document.getElementById('diasSintomas').value || null,
            alergias: document.getElementById('alergias').value,
            cirurgias: document.getElementById('cirurgias').value
        };
        try {
            const response = await fetchAuthenticated('/api/agendamentos', { method: 'POST', body: JSON.stringify(agendamentoDTO) });
            if (response.ok) {
                showToast('Agendamento realizado com sucesso!', 'success');
                renderMeusAgendamentos();
            } else {
                await handleApiError(response, 'booking-error-message');
            }
        } catch (err) {
            showToast('Erro de rede ao agendar.', 'error');
        }
    }

    // --- SEÇÃO 3: MEUS AGENDAMENTOS E DOCUMENTOS ---

    async function renderMeusAgendamentos() {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        contentDinamico.innerHTML = `<h3>Meus Agendamentos</h3><ul id="lista-meus-agendamentos" class="medico-list"><li>Carregando...</li></ul>`;
        try {
            const response = await fetchAuthenticated('/api/agendamentos/meus');
            if (!response.ok) throw new Error('Falha ao buscar agendamentos');
            const agendamentos = await response.json();
            const listaUL = document.getElementById('lista-meus-agendamentos');
            listaUL.innerHTML = '';
            if (agendamentos.length === 0) {
                listaUL.innerHTML = '<li>Você não possui agendamentos.</li>';
                return;
            }
            agendamentos.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
            agendamentos.forEach(ag => {
                const li = document.createElement('li');
                li.className = 'medico-item';
                li.style.display = 'flex'; li.style.justifyContent = 'space-between';
                li.innerHTML = `<div><strong>[${ag.status}] ${new Date(ag.dataHora).toLocaleString('pt-BR')}</strong><br><small>Médico(a): ${ag.medico.nome}</small></div>`;
                if (ag.status === 'PENDENTE' || ag.status === 'CONFIRMADO') {
                    const btnCancel = document.createElement('button');
                    btnCancel.className = 'btn-delete'; btnCancel.textContent = 'Cancelar';
                    btnCancel.onclick = () => handleCancelarAgendamento(ag.idAgendamento);
                    li.appendChild(btnCancel);
                }
                listaUL.appendChild(li);
            });
        } catch (err) {
            console.error(err);
            contentDinamico.innerHTML = '<p>Erro ao carregar agendamentos.</p>';
        }
    }

    async function handleCancelarAgendamento(agendamentoId) {
        if (!confirm('Tem certeza que deseja cancelar?')) return;
        try {
            const response = await fetchAuthenticated(`/api/agendamentos/${agendamentoId}/cancelar`, { method: 'PUT' });
            if (response.ok) {
                showToast('Agendamento cancelado!', 'success');
                renderMeusAgendamentos();
            } else {
                const errorData = await response.json();
                showToast(`Erro: ${errorData.message}`, 'error');
            }
        } catch (err) {
            showToast('Erro de rede ao cancelar.', 'error');
        }
    }

    async function renderMinhasPrescricoes() {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        contentDinamico.innerHTML = `<h3>Minhas Prescrições</h3><div id="container-docs">Carregando...</div>`;
        try {
            const response = await fetchAuthenticated('/api/prescricoes/meus');
            if (!response.ok) throw new Error('Falha ao buscar prescrições.');
            const prescricoes = await response.json();
            const container = document.getElementById('container-docs');
            container.innerHTML = '';
            if (prescricoes.length === 0) {
                container.innerHTML = '<p>Nenhuma prescrição encontrada.</p>';
            } else {
                prescricoes.forEach(p => {
                    container.innerHTML += `<div class="document-item"><p class="meta">Emitido por <strong>Dr(a). ${p.medico.nome}</strong> em ${new Date(p.dataEmissao).toLocaleDateString('pt-BR')}</p><pre class="content">${p.medicamentos}</pre></div>`;
                });
            }
        } catch (err) {
            console.error(err);
            contentDinamico.innerHTML = '<p>Erro ao carregar prescrições.</p>';
        }
    }

    async function renderMeusAtestados() {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        contentDinamico.innerHTML = `<h3>Meus Atestados</h3><div id="container-docs">Carregando...</div>`;
        try {
            const response = await fetchAuthenticated('/api/atestados/meus');
            if (!response.ok) throw new Error('Falha ao buscar atestados.');
            const atestados = await response.json();
            const container = document.getElementById('container-docs');
            container.innerHTML = '';
            if (atestados.length === 0) {
                container.innerHTML = '<p>Nenhum atestado encontrado.</p>';
            } else {
                atestados.forEach(a => {
                    container.innerHTML += `<div class="document-item"><p class="meta">Emitido por <strong>Dr(a). ${a.medico.nome}</strong> em ${new Date(a.dataEmissao).toLocaleDateString('pt-BR')}</p><pre class="content">${a.descricao}</pre></div>`;
                });
            }
        } catch (err) {
            console.error(err);
            contentDinamico.innerHTML = '<p>Erro ao carregar atestados.</p>';
        }
    }

    async function renderMeusExames() {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        contentDinamico.innerHTML = `<h3>Meus Exames</h3><div id="container-docs">Carregando...</div>`;
        try {
            const response = await fetchAuthenticated('/api/exames/meus');
            if (!response.ok) throw new Error('Falha ao buscar exames.');
            const exames = await response.json();
            const container = document.getElementById('container-docs');
            container.innerHTML = '';
            if (exames.length === 0) {
                container.innerHTML = '<p>Nenhum exame encontrado.</p>';
            } else {
                exames.forEach(e => {
                    container.innerHTML += `<div class="document-item"><p class="meta">Solicitado por <strong>Dr(a). ${e.medico.nome}</strong> em ${new Date(e.dataRealizacao).toLocaleDateString('pt-BR')}</p><div class="content"><strong>Tipo:</strong> ${e.tipo}</div><div class="content" style="margin-top: 0.5rem;"><strong>Resultado:</strong> ${e.resultado || 'Aguardando'}</div></div>`;
                });
            }
        } catch (err) {
            console.error(err);
            contentDinamico.innerHTML = '<p>Erro ao carregar exames.</p>';
        }
    }

    // --- Inicializa o Dashboard ---
    initPacienteDashboard();
});