document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');

    // --- Funções e Constantes de Helper ---
    const DIAS_SEMANA_MAP = {
        "DOMINGO": 0, "SEGUNDA": 1, "TERCA": 2, "QUARTA": 3, "QUINTA": 4, "SEXTA": 5, "SABADO": 6
    };

    function getProximaDataISO(diaDaSemanaAlvo, horaMinuto) {
        const [hora, minuto] = horaMinuto.split(':').map(Number);
        const agora = new Date();
        const diaDeHoje = agora.getDay();
        const diaAlvoJS = DIAS_SEMANA_MAP[diaDaSemanaAlvo.toUpperCase()];
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
        contentArea.innerHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card" id="card-agendar">Novo Agendamento</div>
                <div class="dashboard-card" id="card-meus-agendamentos">Meus Agendamentos</div>
                <div class="dashboard-card" id="card-meus-documentos">Minhas Prescrições/Atestados</div>
            </div>
            <hr>
            <div id="paciente-content-dinamico"></div>
        `;

        // ADICIONA OS LISTENERS PARA TODOS OS CARDS
        document.getElementById('card-agendar').addEventListener('click', renderListaMedicos);
        document.getElementById('card-meus-agendamentos').addEventListener('click', renderMeusAgendamentos);
        document.getElementById('card-meus-documentos').addEventListener('click', renderMeusDocumentos);

        // Carrega a visão principal (Novo Agendamento) por padrão
        renderListaMedicos();
    }

    // --- RENDER: FLUXO DE NOVO AGENDAMENTO ---

    async function renderListaMedicos() {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        contentDinamico.innerHTML = `<h3>Médicos Disponíveis</h3><p>Selecione um profissional para ver os horários.</p><ul id="lista-medicos" class="medico-list"><li>Carregando...</li></ul>`;

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

            let htmlAgenda = `<h3>Agenda de ${medico.nome} (${medico.especialidade})</h3>`;
            htmlAgenda += `<button class="btn-cancel" id="btn-voltar-lista" style="margin-bottom: 1rem;">&larr; Voltar</button>`;

            if (!agenda.dias || agenda.dias.length === 0) {
                htmlAgenda += '<p>Este médico ainda não cadastrou horários.</p>';
            } else {
                htmlAgenda += '<p>Selecione um horário para agendar:</p>';
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

        contentDinamico.innerHTML = `
            <div class="booking-form-container">
                <h4>Confirmar Agendamento</h4>
                <p>Médico: <strong>${nomeMedico}</strong> | Horário: <strong style="font-size: 1.2rem;">${dataFormatada}</strong></p>
                <form id="form-agendamento-final" style="margin-top: 1.5rem;">
                    <div id="booking-error-message" class="error-message" style="display:none;"></div>
                    <div class="input-group"><label>Sintomas (obrigatório)</label><textarea id="sintomas" required></textarea></div>
                    <div class="input-group"><label>Sintomas há quantos dias?</label><input type="number" id="diasSintomas" min="0"></div>
                    <div class="input-group"><label>Alergias (Opcional)</label><input type="text" id="alergias"></div>
                    <div class="input-group"><label>Cirurgias prévias (Opcional)</label><input type="text" id="cirurgias"></div>
                    <div class="form-actions"><button type="submit" class="btn-confirm">Confirmar</button><button type="button" class="btn-cancel" id="btn-cancelar">Voltar</button></div>
                </form>
            </div>
        `;

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
                alert('Agendamento realizado com sucesso!');
                renderMeusAgendamentos(); // Leva para a lista de agendamentos após o sucesso
            } else {
                await handleApiError(response, 'booking-error-message');
            }
        } catch (err) {
            document.getElementById('booking-error-message').textContent = 'Erro de rede.';
            document.getElementById('booking-error-message').style.display = 'block';
        }
    }

    // --- RENDER: MEUS AGENDAMENTOS E DOCUMENTOS ---

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
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.innerHTML = `<div><strong>[${ag.status}] ${new Date(ag.dataHora).toLocaleString('pt-BR')}</strong><br><small>Médico(a): ${ag.medico.nome}</small></div>`;

                if (ag.status === 'PENDENTE' || ag.status === 'CONFIRMADO') {
                    const btnCancel = document.createElement('button');
                    btnCancel.className = 'btn-delete';
                    btnCancel.textContent = 'Cancelar';
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
        if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

        try {
            const response = await fetchAuthenticated(`/api/agendamentos/${agendamentoId}/cancelar`, { method: 'PUT' });
            if (response.ok) {
                alert('Agendamento cancelado com sucesso!');
                renderMeusAgendamentos();
            } else {
                await handleApiError(response, null);
                alert('Não foi possível cancelar o agendamento.');
            }
        } catch (err) {
            alert('Erro de rede ao tentar cancelar.');
        }
    }

    async function renderMeusDocumentos() {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        contentDinamico.innerHTML = `<h3>Meus Documentos</h3><div id="documentos-container">Carregando...</div>`;

        try {
            const [respPrescricoes, respAtestados] = await Promise.all([
                fetchAuthenticated('/api/prescricoes/meus'),
                fetchAuthenticated('/api/atestados/meus')
            ]);

            if (!respPrescricoes.ok || !respAtestados.ok) throw new Error('Falha ao buscar docs.');

            const prescricoes = await respPrescricoes.json();
            const atestados = await respAtestados.json();

            let html = '<div class="document-list-container">';
            html += '<h4>Prescrições</h4>';
            if (prescricoes.length === 0) {
                html += '<p>Nenhuma prescrição encontrada.</p>';
            } else {
                prescricoes.forEach(p => {
                    html += `<div class="document-item"><p class="meta">Emitido por <strong>Dr(a). ${p.medico.nome}</strong> em ${new Date(p.dataEmissao).toLocaleDateString('pt-BR')}</p><pre class="content">${p.medicamentos}</pre></div>`;
                });
            }
            html += '</div><hr><div class="document-list-container">';
            html += '<h4>Atestados</h4>';
            if (atestados.length === 0) {
                html += '<p>Nenhum atestado encontrado.</p>';
            } else {
                atestados.forEach(a => {
                    html += `<div class="document-item"><p class="meta">Emitido por <strong>Dr(a). ${a.medico.nome}</strong> em ${new Date(a.dataEmissao).toLocaleDateString('pt-BR')}</p><pre class="content">${a.descricao}</pre></div>`;
                });
            }
            html += '</div>';
            document.getElementById('documentos-container').innerHTML = html;

        } catch (err) {
            console.error(err);
            contentDinamico.innerHTML = '<p>Erro ao carregar documentos.</p>';
        }
    }

    // --- Inicializa o Dashboard do Paciente ---
    initPacienteDashboard();
});