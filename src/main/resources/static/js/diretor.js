// ===================================================================
// DIRETOR.JS (VERSÃO COMPLETA E ATUALIZADA)
// Inclui filtro de status, visualização de conteúdo e edição de perfil.
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    let idUsuarioLogado = null;
    let dadosUsuarioAtual = null; // Armazena os dados do admin logado
    let todosOsUsuarios = []; // Armazena a lista completa de usuários para filtragem
    const SPINNER_HTML = `<div class="spinner-container"><div class="spinner"></div></div>`;

    async function initDiretorDashboard() {
        try {
            // Busca os dados do perfil do admin logado
            const responseMe = await fetchAuthenticated('/api/usuarios/me');
            if (!responseMe || !responseMe.ok) throw new Error('Falha ao buscar perfil do admin');
            dadosUsuarioAtual = await responseMe.json(); // Armazena os dados
            idUsuarioLogado = dadosUsuarioAtual.id; // Guarda o ID

            // Atualiza a mensagem de boas-vindas
            const welcomeMsg = document.getElementById('welcome-message');
            if (welcomeMsg && dadosUsuarioAtual.nome) {
                welcomeMsg.textContent = `Seja bem-vindo(a), ${dadosUsuarioAtual.nome}!`;
            }

        } catch (e) {
            console.error("Erro fatal ao carregar dados do administrador:", e);
            contentArea.innerHTML = "<p>Erro fatal ao carregar dados do administrador. Faça login novamente.</p>";
            // Considerar deslogar
            // setTimeout(logout, 3000);
            return;
        }

        // Renderiza a grade de cards do menu principal
        contentArea.innerHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card admin" id="card-gerenciar-unidades">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building-2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
                    <span>Gerenciar Unidades</span>
                </div>
                <div class="dashboard-card admin" id="card-gerenciar-medicos">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-medical-square"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                    <span>Gerenciar Médicos</span>
                </div>
                <div class="dashboard-card admin" id="card-gerenciar-usuarios">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <span>Gerenciar Usuários</span>
                </div>
                <div class="dashboard-card admin" id="card-gerenciar-conteudo">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-check"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
                    <span>Gerenciar Conteúdo</span>
                </div>
                <div class="dashboard-card" id="card-meu-perfil">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
                    <span>Meu Perfil</span>
                </div>
                <div class="dashboard-card" id="card-noticias">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                    <span>Notícias e Artigos</span>
                </div>
            </div>
            <hr>
            <div id="diretor-content-dinamico"></div>
        `;
        document.getElementById('card-gerenciar-unidades').addEventListener('click', renderGerenciadorDeUnidades);
        document.getElementById('card-gerenciar-medicos').addEventListener('click', renderGerenciadorDeMedicos);
        document.getElementById('card-gerenciar-usuarios').addEventListener('click', renderGerenciadorDeUsuarios);
        document.getElementById('card-gerenciar-conteudo').addEventListener('click', renderGerenciadorDeConteudo);
        document.getElementById('card-meu-perfil').addEventListener('click', renderMeuPerfil); // Atualizado
        document.getElementById('card-noticias').addEventListener('click', () => {
            document.getElementById('diretor-content-dinamico').innerHTML = `
                <div class="section-card">
                    <div class="admin-section-header"><h3>Notícias e Artigos Públicos</h3></div>
                    <div id="public-news-container"></div>
                </div>`;
            renderNoticiasPublicas('public-news-container'); // Chama a função comum
        });

        // Configura o modal de pré-visualização (se existir no HTML)
        const previewModal = document.getElementById('preview-modal');
        if (previewModal) {
            document.getElementById('preview-modal-close').addEventListener('click', closePreviewModal);
            previewModal.addEventListener('click', (e) => { if (e.target.id === 'preview-modal') closePreviewModal(); });
        }
        // Configura o modal de confirmação (se existir no HTML)
        const confirmationModal = document.getElementById('confirmation-modal');
        if (confirmationModal) {
            // Listener genérico para fechar clicando fora
            confirmationModal.addEventListener('click', (e) => {
                if (e.target.id === 'confirmation-modal') {
                    confirmationModal.style.display = 'none';
                    // É importante remover listeners específicos se foram adicionados dinamicamente
                }
            });
            // O botão de cancelar pode ter um listener fixo aqui se não precisar mudar a lógica
            const btnCancel = document.getElementById('modal-btn-cancel');
            if (btnCancel) {
                btnCancel.addEventListener('click', () => {
                    confirmationModal.style.display = 'none';
                });
            }
        }


        renderGerenciadorDeUnidades(); // Começa na tela de unidades
    }

    // --- Funções de Gerenciamento (Unidades, Médicos, Conteúdo) ---

    async function renderGerenciadorDeUnidades() {
        const adminContent = document.getElementById('diretor-content-dinamico');
        adminContent.innerHTML = `
            <div class="section-card">
                <div class="admin-section-header">
                    <h4>Unidades de Saúde</h4>
                    <button class="btn btn-new" id="btn-nova-unidade">+ Nova Unidade</button>
                </div>
                <div id="unidade-form-container" style="display: none; margin-bottom: 1.5rem;"></div>
                <div id="lista-unidades" class="admin-table-container">${SPINNER_HTML}</div>
            </div>
        `;
        document.getElementById('btn-nova-unidade').addEventListener('click', () => {
            const formContainer = document.getElementById('unidade-form-container');
            if (formContainer.style.display === 'none') {
                renderFormCadastroUnidade();
                formContainer.style.display = 'block';
                formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                formContainer.style.display = 'none';
            }
        });
        await carregarListaUnidades();
    }

    function renderFormCadastroUnidade() {
        const formContainer = document.getElementById('unidade-form-container');
        // Lista de RAs do DF
        const regioesAdmin = ["Plano Piloto", "Gama", "Taguatinga", "Brazlândia", "Sobradinho", "Planaltina", "Paranoá", "Núcleo Bandeirante", "Ceilândia", "Guará", "Cruzeiro", "Samambaia", "Santa Maria", "São Sebastião", "Recanto das Emas", "Lago Sul", "Riacho Fundo", "Lago Norte", "Candangolândia", "Águas Claras", "Riacho Fundo II", "Sudoeste/Octogonal", "Varjão", "Park Way", "SCIA (Estrutural)", "Sobradinho II", "Jardim Botânico", "Itapoã", "SIA", "Vicente Pires", "Fercal", "Sol Nascente/Pôr do Sol", "Arniqueira"];
        let optionsHtml = '<option value="" disabled selected>Selecione...</option>';
        regioesAdmin.sort().forEach(ra => { optionsHtml += `<option value="${ra}">${ra}</option>`; });

        formContainer.innerHTML = `
        <div class="booking-form-container" style="padding-top: 1rem; padding-bottom: 1rem; box-shadow: none; border: 1px solid var(--cor-borda);">
            <h5>Cadastrar Nova Unidade</h5>
            <form id="form-cad-unidade">
                <div id="unidade-error-message" class="error-message" style="display:none;"></div>
                <div class="input-group"><label for="unidade-nome">Nome da Unidade *</label><input type="text" id="unidade-nome" required></div>
                <div class="input-group"><label for="unidade-endereco">Endereço Completo *</label><input type="text" id="unidade-endereco" required></div>
                <div class="input-group"><label for="unidade-ra">Região Administrativa *</label><select id="unidade-ra" required>${optionsHtml}</select></div>
                <div class="input-group"><label for="unidade-cep">CEP *</label><input type="text" id="unidade-cep" placeholder="XXXXX-XXX" required maxlength="9"></div>
                <div class="input-group"><label for="unidade-telefone">Telefone</label><input type="tel" id="unidade-telefone" placeholder="(XX) XXXX-XXXX ou (XX) XXXXX-XXXX"></div>
                <div class="form-actions" style="justify-content: flex-end;">
                     <button type="submit" class="btn btn-success">Salvar Unidade</button>
                     <button type="button" class="btn btn-secondary" id="btn-cancelar-unidade">Cancelar</button>
                </div>
            </form>
        </div>`;
        // Adiciona máscara e listener ao CEP e Telefone
        const cepInput = document.getElementById('unidade-cep');
        const telInput = document.getElementById('unidade-telefone');
        cepInput.addEventListener('input', (e) => { e.target.value = formatCEP(e.target.value); });
        telInput.addEventListener('input', (e) => { e.target.value = formatTelefone(e.target.value); });

        document.getElementById('form-cad-unidade').addEventListener('submit', handleCadastroUnidadeSubmit);
        document.getElementById('btn-cancelar-unidade').addEventListener('click', () => {
            document.getElementById('unidade-form-container').style.display = 'none';
        });
    }

    async function carregarListaUnidades() {
        const container = document.getElementById('lista-unidades');
        container.innerHTML = SPINNER_HTML; // Mostra spinner enquanto carrega
        try {
            const response = await fetchAuthenticated('/api/unidades-saude');
            if (!response || !response.ok) throw new Error('Falha ao buscar unidades');
            const unidades = await response.json();
            // Ordena unidades pelo nome
            unidades.sort((a, b) => a.nome.localeCompare(b.nome));

            let tableHTML = `<table class="admin-table"><thead><tr><th>ID</th><th>Nome</th><th>Região</th><th>Telefone</th></tr></thead><tbody>`;
            if (unidades.length === 0) {
                tableHTML += '<tr><td colspan="4">Nenhuma unidade cadastrada.</td></tr>';
            } else {
                unidades.forEach(u => tableHTML += `
                    <tr>
                        <td>${u.id}</td>
                        <td>${u.nome}</td>
                        <td>${u.regiaoAdministrativa}</td>
                        <td>${formatTelefone(u.telefone) || 'N/A'}</td>
                     </tr>`);
            }
            tableHTML += '</tbody></table>';
            container.innerHTML = tableHTML;
        } catch (err) {
            console.error(err);
            container.innerHTML = '<p>Erro ao carregar unidades.</p>';
        }
    }

    async function handleCadastroUnidadeSubmit(event) {
        event.preventDefault();
        const nomeInput = document.getElementById('unidade-nome');
        const enderecoInput = document.getElementById('unidade-endereco');
        const raInput = document.getElementById('unidade-ra');
        const cepInput = document.getElementById('unidade-cep');
        const telInput = document.getElementById('unidade-telefone');

        // Remove máscaras antes de enviar
        const cepLimpo = cepInput.value.replace(/\D/g, '');
        const telefoneLimpo = telInput.value.replace(/\D/g, '');

        if (cepLimpo.length !== 8) {
            showToast('CEP inválido. Deve conter 8 números.', 'error');
            cepInput.focus();
            return;
        }
        if (telefoneLimpo && (telefoneLimpo.length < 10 || telefoneLimpo.length > 11)) {
            showToast('Telefone inválido.', 'error');
            telInput.focus();
            return;
        }
        if (!raInput.value) {
            showToast('Selecione a Região Administrativa.', 'error');
            raInput.focus();
            return;
        }

        const dados = {
            nome: nomeInput.value,
            endereco: enderecoInput.value,
            regiaoAdministrativa: raInput.value,
            cep: cepLimpo,
            telefone: telefoneLimpo || null // Envia null se vazio
        };

        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Salvando...';
        const errorDiv = document.getElementById('unidade-error-message');
        errorDiv.style.display = 'none';

        try {
            const response = await fetchAuthenticated('/api/unidades-saude', { method: 'POST', body: JSON.stringify(dados) });
            if (response && response.ok) {
                showToast('Unidade cadastrada com sucesso!', 'success');
                document.getElementById('unidade-form-container').style.display = 'none'; // Esconde form
                document.getElementById('unidade-form-container').innerHTML = ''; // Limpa form
                await carregarListaUnidades(); // Recarrega lista
            } else {
                await handleApiError(response, 'unidade-error-message');
            }
        } catch (err) {
            console.error("Erro ao cadastrar unidade:", err);
            showToast('Erro de rede ao cadastrar unidade.', 'error');
            errorDiv.textContent = 'Erro de rede. Verifique sua conexão.';
            errorDiv.style.display = 'block';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Salvar Unidade';
        }
    }

    async function renderGerenciadorDeMedicos() {
        const adminContent = document.getElementById('diretor-content-dinamico');
        adminContent.innerHTML = `
            <div class="section-card">
                <div class="admin-section-header">
                    <h4>Médicos do Sistema</h4>
                    <button class="btn btn-new" id="btn-novo-medico">+ Novo Médico</button>
                </div>
                <div id="medico-form-container" style="display: none; margin-bottom: 1.5rem;"></div>
                <div id="lista-medicos" class="admin-table-container">${SPINNER_HTML}</div>
            </div>`;
        document.getElementById('btn-novo-medico').addEventListener('click', async () => {
            const formContainer = document.getElementById('medico-form-container');
            if (formContainer.style.display === 'none') {
                try {
                    const responseUnidades = await fetchAuthenticated('/api/unidades-saude');
                    if (!responseUnidades || !responseUnidades.ok || (await responseUnidades.clone().json()).length === 0) {
                        throw new Error('Nenhuma unidade de saúde cadastrada. Cadastre uma unidade primeiro.');
                    }
                    const unidades = await responseUnidades.json();
                    renderFormCadastroMedico(unidades);
                    formContainer.style.display = 'block';
                    formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } catch (err) {
                    showToast(err.message, 'error');
                }
            } else {
                formContainer.style.display = 'none';
            }
        });
        await carregarTabelaMedicos();
    }

    async function carregarTabelaMedicos() {
        const container = document.getElementById('lista-medicos');
        container.innerHTML = SPINNER_HTML;
        try {
            const response = await fetchAuthenticated('/api/medicos');
            if (!response || !response.ok) throw new Error('Falha ao buscar médicos.');
            const medicos = await response.json();
            // Ordena médicos por nome
            medicos.sort((a, b) => a.nome.localeCompare(b.nome));

            let tableHTML = `<table class="admin-table"><thead><tr><th>ID</th><th>Nome</th><th>Especialidade</th><th>Unidade</th><th>Status</th><th>Ações</th></tr></thead><tbody>`;
            if (medicos.length === 0) {
                tableHTML += '<tr><td colspan="6">Nenhum médico cadastrado.</td></tr>';
            } else {
                medicos.forEach(medico => {
                    const statusBadge = medico.ativo
                        ? '<span class="badge status-CONFIRMADO">Ativo</span>' // Verde para Ativo
                        : '<span class="badge status-CANCELADO">Inativo</span>'; // Vermelho para Inativo
                    const actionButtonClass = medico.ativo ? 'btn-danger' : 'btn-success'; // Vermelho p/ desativar, Verde p/ reativar
                    const actionButtonText = medico.ativo ? 'Desativar' : 'Reativar';
                    tableHTML += `
                        <tr>
                            <td>${medico.id}</td>
                            <td>${medico.nome}</td>
                            <td>${medico.especialidade ? medico.especialidade.replace(/_/g, ' ') : 'N/A'}</td>
                            <td>${medico.unidade ? medico.unidade.nome : 'N/A'}</td>
                            <td>${statusBadge}</td>
                            <td><button class="btn ${actionButtonClass} btn-sm btn-toggle-medico" data-medico-id="${medico.id}" data-medico-nome="${medico.nome}" data-ativo="${medico.ativo}">${actionButtonText}</button></td>
                        </tr>`;
                });
            }
            tableHTML += '</tbody></table>';
            container.innerHTML = tableHTML;
            document.querySelectorAll('.btn-toggle-medico').forEach(button => {
                button.addEventListener('click', e => {
                    handleToggleAtivacaoMedico(e.target.dataset.medicoId, e.target.dataset.medicoNome, e.target.dataset.ativo === 'true');
                });
            });
        } catch (err) { console.error(err); container.innerHTML = '<p>Erro ao carregar médicos.</p>'; }
    }

    function renderFormCadastroMedico(unidades) {
        const formContainer = document.getElementById('medico-form-container');
        let optionsUnidades = '<option value="" disabled selected>Selecione...</option>';
        unidades.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(u => optionsUnidades += `<option value="${u.id}">${u.nome}</option>`);

        const especialidades = ["CLINICA_GERAL", "MEDICINA_FAMILIA_COMUNIDADE", "PEDIATRIA", "GINECOLOGIA_OBSTETRICIA", "DERMATOLOGIA", "CARDIOLOGIA", "PSIQUIATRIA", "ODONTOLOGIA", "ENFERMAGEM"];
        let optionsEspecialidades = '<option value="" disabled selected>Selecione...</option>';
        especialidades.forEach(esp => optionsEspecialidades += `<option value="${esp}">${esp.replace(/_/g, ' ')}</option>`);


        formContainer.innerHTML = `
            <div class="booking-form-container" style="padding-top: 1rem; padding-bottom: 1rem; box-shadow: none; border: 1px solid var(--cor-borda);">
                <h5>Cadastrar Novo Médico</h5>
                <form id="form-cad-medico">
                    <div id="admin-med-error" class="error-message" style="display: none;"></div>
                    <div class="input-group"><label for="med-unidade">Unidade de Saúde *</label><select id="med-unidade" required>${optionsUnidades}</select></div>
                    <div class="input-group"><label for="med-nome">Nome Completo *</label><input type="text" id="med-nome" required></div>
                    <div class="input-group"><label for="med-email">Email *</label><input type="email" id="med-email" required></div>
                    <div class="input-group"><label for="med-cpf">CPF *</label><input type="text" id="med-cpf" required placeholder="XXX.XXX.XXX-XX"></div>
                    <div class="input-group"><label for="med-crm">CRM *</label><input type="text" id="med-crm" required placeholder="XXXX-DF"></div>
                    <div class="input-group"><label for="med-especialidade">Especialidade *</label><select id="med-especialidade" required>${optionsEspecialidades}</select></div>
                    <div class="input-group"><label for="med-senha">Senha Provisória *</label><input type="password" id="med-senha" required minlength="6"></div>
                     <div class="password-criteria-container" style="margin-top: -0.5rem; margin-bottom: 1rem;">
                        <ul>
                            <li id="length-check-med-cad">Pelo menos 6 caracteres</li>
                            <li id="number-check-med-cad">Conter pelo menos um número</li>
                        </ul>
                    </div>
                     <div class="form-actions" style="justify-content: flex-end;">
                        <button type="submit" class="btn btn-success">Cadastrar Médico</button>
                        <button type="button" class="btn btn-secondary" id="btn-cancelar-medico">Cancelar</button>
                    </div>
                </form>
            </div>`;

        // Adiciona máscaras e validação de senha
        const cpfInput = document.getElementById('med-cpf');
        const senhaInput = document.getElementById('med-senha');
        const lengthCheck = document.getElementById('length-check-med-cad');
        const numberCheck = document.getElementById('number-check-med-cad');

        cpfInput.addEventListener('input', (e) => { e.target.value = formatCPF(e.target.value); });
        senhaInput.addEventListener('input', () => {
            const senha = senhaInput.value;
            lengthCheck.classList.toggle('valid', senha.length >= 6);
            numberCheck.classList.toggle('valid', /\d/.test(senha));
        });

        document.getElementById('form-cad-medico').addEventListener('submit', handleCadastroMedicoSubmit);
        document.getElementById('btn-cancelar-medico').addEventListener('click', () => {
            document.getElementById('medico-form-container').style.display = 'none';
            document.getElementById('medico-form-container').innerHTML = ''; // Limpa o form
        });
    }

    async function handleCadastroMedicoSubmit(event) {
        event.preventDefault();
        const nomeInput = document.getElementById('med-nome');
        const emailInput = document.getElementById('med-email');
        const cpfInput = document.getElementById('med-cpf');
        const crmInput = document.getElementById('med-crm');
        const especialidadeInput = document.getElementById('med-especialidade');
        const senhaInput = document.getElementById('med-senha');
        const unidadeInput = document.getElementById('med-unidade');

        // Remove máscara do CPF
        const cpfLimpo = cpfInput.value.replace(/\D/g, '');

        // Validações
        if (cpfLimpo.length !== 11) {
            showToast('CPF inválido. Deve conter 11 números.', 'error');
            cpfInput.focus();
            return;
        }
        if (senhaInput.value.length < 6 || !/\d/.test(senhaInput.value)) {
            showToast('A senha não atende aos critérios mínimos.', 'error');
            senhaInput.focus();
            return;
        }
        if (!unidadeInput.value) {
            showToast('Selecione uma Unidade de Saúde.', 'error');
            unidadeInput.focus();
            return;
        }
        if (!especialidadeInput.value) {
            showToast('Selecione uma Especialidade.', 'error');
            especialidadeInput.focus();
            return;
        }


        const dadosMedico = {
            nome: nomeInput.value,
            email: emailInput.value,
            cpf: cpfLimpo,
            crm: crmInput.value,
            especialidade: especialidadeInput.value,
            senha: senhaInput.value,
            idUnidade: parseInt(unidadeInput.value)
        };

        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Cadastrando...';
        const errorDiv = document.getElementById('admin-med-error');
        errorDiv.style.display = 'none';


        try {
            const response = await fetchAuthenticated('/api/medicos', { method: 'POST', body: JSON.stringify(dadosMedico) });
            if (response && response.ok) {
                showToast('Médico cadastrado com sucesso!', 'success');
                document.getElementById('medico-form-container').style.display = 'none';
                document.getElementById('medico-form-container').innerHTML = '';
                await carregarTabelaMedicos();
            } else { await handleApiError(response, 'admin-med-error'); }
        } catch (err) {
            console.error("Erro ao cadastrar médico:", err);
            showToast('Erro de rede ao cadastrar médico.', 'error');
            errorDiv.textContent = 'Erro de rede. Verifique sua conexão.';
            errorDiv.style.display = 'block';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Cadastrar Médico';
        }
    }

    async function handleToggleAtivacaoMedico(medicoId, medicoNome, isAtivo) {
        const acao = isAtivo ? 'desativar' : 'reativar';
        showConfirmationModal(`Tem certeza que deseja ${acao} o(a) médico(a) ${medicoNome}?`, async () => {
            try {
                const dto = { ativo: !isAtivo };
                // O endpoint para ativar/desativar médico é o PUT /api/medicos/{id}
                const response = await fetchAuthenticated(`/api/medicos/${medicoId}`, { method: 'PUT', body: JSON.stringify(dto) });
                if (response && response.ok) {
                    showToast(`Médico ${isAtivo ? 'desativado' : 'reativado'}!`, 'success');
                    await carregarTabelaMedicos(); // Recarrega a tabela
                } else { await handleApiError(response, null); } // Mostra erro via Toast
            } catch (err) {
                console.error(`Erro ao ${acao} médico:`, err);
                showToast('Erro de rede.', 'error');
            }
        }, isAtivo ? 'btn-danger' : 'btn-success'); // Passa a classe do botão de confirmação
    }


    async function renderGerenciadorDeUsuarios() {
        const adminContent = document.getElementById('diretor-content-dinamico');
        adminContent.innerHTML = `
            <div class="section-card">
                <div class="admin-section-header">
                    <h4>Usuários do Sistema</h4>
                      Filtro de Status -->
                    <div class="filter-group" style="margin-left: auto; min-width: 150px;">
                        <label for="filtro-status-usuario" style="margin-bottom: 0.25rem; font-size: 0.8rem;">Filtrar por Status</label>
                        <select id="filtro-status-usuario">
                            <option value="todos">Todos</option>
                            <option value="ativos">Ativos</option>
                            <option value="inativos">Inativos</option>
                        </select>
                    </div>
                </div>
                <div id="admin-user-list-container">${SPINNER_HTML}</div>
            </div>`;

        // Adiciona listener para o filtro
        document.getElementById('filtro-status-usuario').addEventListener('change', () => {
            renderUserTable(todosOsUsuarios); // Re-renderiza a tabela com o filtro aplicado
        });

        try {
            const response = await fetchAuthenticated('/api/usuarios');
            if (!response || !response.ok) throw new Error('Falha ao buscar usuários');
            todosOsUsuarios = await response.json(); // Armazena a lista completa
            renderUserTable(todosOsUsuarios); // Renderiza a tabela inicial (com filtro "Todos")
        } catch (err) {
            console.error(err);
            document.getElementById('admin-user-list-container').innerHTML = `<p>Erro ao carregar usuários.</p>`;
        }
    }

    // Função para renderizar a tabela de usuários com base na lista (e filtro)
    function renderUserTable(usuarios) {
        const container = document.getElementById('admin-user-list-container');
        const filtro = document.getElementById('filtro-status-usuario')?.value || 'todos';

        const usuariosFiltrados = usuarios.filter(user => {
            if (filtro === 'ativos') return user.ativo;
            if (filtro === 'inativos') return !user.ativo;
            return true; // 'todos'
        }).sort((a, b) => a.nome.localeCompare(b.nome)); // Ordena por nome


        let tableHTML = `<div class="admin-table-container"><table class="admin-table"><thead><tr><th>ID</th><th>Nome</th><th>Email</th><th>Perfil</th><th>Status</th><th>Ações</th></tr></thead><tbody>`;
        if (usuariosFiltrados.length === 0) {
            tableHTML += `<tr><td colspan="6">Nenhum usuário encontrado ${filtro !== 'todos' ? 'com este status' : ''}.</td></tr>`;
        } else {
            usuariosFiltrados.forEach(user => {
                const isSelf = (user.id === idUsuarioLogado);
                const statusBadge = user.ativo
                    ? '<span class="badge status-CONFIRMADO">Ativo</span>'
                    : '<span class="badge status-CANCELADO">Inativo</span>';
                const actionButtonClass = user.ativo ? 'btn-danger' : 'btn-success';
                const actionButtonText = user.ativo ? 'Desativar' : 'Reativar';
                // Define qual função chamar no onclick baseado no status
                const actionHandler = user.ativo ? 'handleDesativarUsuario' : 'handleReativarUsuario';

                tableHTML += `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.nome}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                        <td>${statusBadge}</td>
                        <td>
                            <button class="btn ${actionButtonClass} btn-sm btn-toggle-user"
                                    data-user-id="${user.id}"
                                    data-user-name="${user.nome}"
                                    data-ativo="${user.ativo}"
                                    onclick="window.${actionHandler}('${user.id}', '${user.nome.replace(/'/g, "\\'")}')" // Chama a função global correta
                                    ${isSelf ? 'disabled title="Não pode alterar o próprio status"' : ''}>
                                ${actionButtonText}
                            </button>
                        </td>
                    </tr>`;
            });
        }
        tableHTML += `</tbody></table></div>`;
        container.innerHTML = tableHTML; // Atualiza o container com a tabela filtrada
    }

    // Torna as funções de ativar/desativar globais para serem chamadas pelo onclick
    window.handleDesativarUsuario = async (userId, userName) => {
        showConfirmationModal(`Tem certeza que deseja DESATIVAR o usuário ${userName}?`, async () => {
            try {
                // Endpoint DELETE /api/usuarios/{id} para desativar
                const response = await fetchAuthenticated(`/api/usuarios/${userId}`, { method: 'DELETE' });
                if (response && response.ok) {
                    showToast('Usuário desativado com sucesso!', 'success');
                    // Atualiza o status na lista local e re-renderiza
                    const userIndex = todosOsUsuarios.findIndex(u => u.id == userId);
                    if (userIndex > -1) todosOsUsuarios[userIndex].ativo = false;
                    renderUserTable(todosOsUsuarios);
                } else { await handleApiError(response, null); }
            } catch (err) {
                console.error("Erro ao desativar usuário:", err);
                showToast('Erro de rede ao desativar.', 'error');
            }
        }, 'btn-danger');
    }

    window.handleReativarUsuario = async (userId, userName) => {
        showConfirmationModal(`Tem certeza que deseja REATIVAR o usuário ${userName}?`, async () => {
            try {
                // Chama o endpoint PUT /api/usuarios/{id}/reativar para reativar
                const response = await fetchAuthenticated(`/api/usuarios/${userId}/reativar`, { method: 'PUT' });
                if (response && response.ok) {
                    showToast('Usuário reativado com sucesso!', 'success');
                    // Atualiza o status na lista local e re-renderiza
                    const userIndex = todosOsUsuarios.findIndex(u => u.id == userId);
                    if (userIndex > -1) todosOsUsuarios[userIndex].ativo = true;
                    renderUserTable(todosOsUsuarios);
                } else { await handleApiError(response, null); }
            } catch (err) {
                console.error("Erro ao reativar usuário:", err);
                showToast('Erro de rede ao reativar.', 'error');
            }
        }, 'btn-success');
    }

    async function renderGerenciadorDeConteudo() {
        const adminContent = document.getElementById('diretor-content-dinamico');
        adminContent.innerHTML = `<div class="section-card"><div class="admin-section-header"><h4>Moderação de Conteúdo</h4></div><div id="admin-content-list">${SPINNER_HTML}</div></div>`;
        try {
            const response = await fetchAuthenticated('/api/conteudo/admin/todos');
            if (!response || !response.ok) throw new Error('Falha ao buscar conteúdo');
            const conteudos = await response.json();
            let tableHTML = `<div class="admin-table-container"><table class="admin-table"><thead><tr><th>ID</th><th>Título</th><th>Autor</th><th>Status</th><th>Ações</th></tr></thead><tbody>`;
            if (conteudos.length === 0) {
                tableHTML += `<tr><td colspan="5">Nenhum conteúdo para moderar.</td></tr>`;
            } else {
                // Ordena por status (Rascunho primeiro) e depois por ID decrescente
                conteudos.sort((a, b) => {
                    const statusOrder = { 'RASCUNHO': 0, 'PUBLICADO': 1, 'DESATIVADO': 2 };
                    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
                    if (statusDiff !== 0) return statusDiff;
                    return b.id - a.id; // Mais recente primeiro se status igual
                });

                conteudos.forEach(c => {
                    let acoes = `
                        <button class="btn btn-secondary btn-sm btn-visualizar-conteudo" data-id="${c.id}" title="Visualizar">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>`;
                    if (c.status === 'RASCUNHO') {
                        acoes += `
                            <button class="btn btn-success btn-sm btn-aprovar-conteudo" data-id="${c.id}" title="Aprovar e Publicar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                            </button>
                            <button class="btn btn-danger btn-sm btn-deletar-conteudo" data-id="${c.id}" title="Deletar Rascunho">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </button>`;
                    } else if (c.status === 'PUBLICADO') {
                        acoes += `
                            <button class="btn btn-warning btn-sm btn-desativar-conteudo" data-id="${c.id}" title="Desativar (ocultar)">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                            </button>`;
                    } else { // DESATIVADO
                        acoes += `
                            <button class="btn btn-success btn-sm btn-aprovar-conteudo" data-id="${c.id}" title="Reativar e Publicar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                            </button>
                             <button class="btn btn-danger btn-sm btn-deletar-conteudo" data-id="${c.id}" title="Deletar Permanentemente">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </button>`;
                    }
                    tableHTML += `
                        <tr>
                            <td>${c.id}</td>
                            <td>${c.titulo}</td>
                            <td>${c.autor?.nome || 'N/A'}</td>
                            <td><span class="badge ${c.status}">${c.status}</span></td>
                            <td><div class="form-actions" style="gap: 0.5rem; justify-content: flex-start;">${acoes}</div></td>
                        </tr>`;
                });
            }
            tableHTML += `</tbody></table></div>`;
            document.getElementById('admin-content-list').innerHTML = tableHTML;
            // Adiciona listeners aos botões de ação (delegação de eventos)
            document.getElementById('admin-content-list').addEventListener('click', (event) => {
                const button = event.target.closest('button'); // Encontra o botão clicado
                if (!button) return; // Sai se não clicou em um botão

                const id = button.dataset.id;
                if (button.classList.contains('btn-aprovar-conteudo')) {
                    handleUpdateConteudoStatus(id, 'PUBLICADO', 'Aprovar e publicar este conteúdo?');
                } else if (button.classList.contains('btn-desativar-conteudo')) {
                    handleUpdateConteudoStatus(id, 'DESATIVADO', 'Desativar este conteúdo (ele será ocultado)?');
                } else if (button.classList.contains('btn-deletar-conteudo')) {
                    handleDeletarConteudo(id);
                } else if (button.classList.contains('btn-visualizar-conteudo')) {
                    handleVisualizarConteudo(id);
                }
            });

        } catch (err) { console.error(err); adminContent.innerHTML = `<p>Erro ao carregar conteúdo.</p>`; }
    }

    async function handleUpdateConteudoStatus(conteudoId, novoStatus, confirmMessage) {
        showConfirmationModal(confirmMessage, async () => {
            const dto = { status: novoStatus };
            try {
                const response = await fetchAuthenticated(`/api/conteudo/admin/${conteudoId}`, { method: 'PUT', body: JSON.stringify(dto) });
                if (response && response.ok) {
                    showToast(`Conteúdo atualizado para ${novoStatus}!`, 'success');
                    renderGerenciadorDeConteudo(); // Recarrega a lista
                } else { await handleApiError(response, null); }
            } catch (err) {
                console.error("Erro ao atualizar status do conteúdo:", err);
                showToast('Erro de rede.', 'error');
            }
        }, novoStatus === 'PUBLICADO' ? 'btn-success' : (novoStatus === 'DESATIVADO' ? 'btn-warning' : 'btn-danger'));
    }

    async function handleDeletarConteudo(conteudoId) {
        showConfirmationModal('DELETAR PERMANENTEMENTE este conteúdo? Esta ação não pode ser desfeita.', async () => {
            try {
                const response = await fetchAuthenticated(`/api/conteudo/admin/${conteudoId}`, { method: 'DELETE' });
                if (response && response.ok) {
                    showToast(`Conteúdo deletado!`, 'success');
                    renderGerenciadorDeConteudo(); // Recarrega a lista
                } else { await handleApiError(response, null); }
            } catch (err) {
                console.error("Erro ao deletar conteúdo:", err);
                showToast('Erro de rede.', 'error');
            }
        }, 'btn-danger');
    }

    async function handleVisualizarConteudo(conteudoId) {
        try {
            const response = await fetchAuthenticated(`/api/conteudo/admin/${conteudoId}`);
            if (!response || !response.ok) {
                await handleApiError(response, null);
                return;
            };
            const conteudo = await response.json();
            openPreviewModal(conteudo.titulo, conteudo.corpo); // Usa a função do modal
        } catch (err) {
            console.error("Erro ao visualizar conteúdo:", err);
            showToast(err.message || 'Erro de rede ao visualizar', 'error');
        }
    };

    // --- Funções do Modal de Preview ---
    function openPreviewModal(title, content) {
        const modal = document.getElementById('preview-modal');
        if (modal) {
            document.getElementById('preview-title').textContent = title;
            // Limpa o conteúdo anterior antes de adicionar o novo
            const previewBody = document.getElementById('preview-body');
            previewBody.innerHTML = '';
            previewBody.innerHTML = content; // Usa innerHTML para renderizar HTML
            modal.style.display = 'flex';
        } else {
            console.error("Elemento modal 'preview-modal' não encontrado.");
            alert("Erro: Modal de visualização não encontrado.");
        }
    }

    function closePreviewModal() {
        const modal = document.getElementById('preview-modal');
        if (modal) modal.style.display = 'none';
        // Limpa o conteúdo ao fechar para evitar acúmulo
        const previewBody = document.getElementById('preview-body');
        if (previewBody) previewBody.innerHTML = '';
    }

    // --- Funções de Perfil (Admin/Diretor) ---
    function renderMeuPerfil() {
        const contentDinamico = document.getElementById('diretor-content-dinamico');
        const usuario = dadosUsuarioAtual; // Usar os dados já carregados

        if (!usuario) {
            contentDinamico.innerHTML = '<p>Erro ao carregar dados do perfil.</p>';
            return;
        }

        contentDinamico.innerHTML = `
        <div class="section-card">
             <div class="admin-section-header">
                <h3>Meu Perfil</h3>
            </div>
            <div id="perfil-info-admin" class="document-item">
                 <p><strong>Nome:</strong> <span id="display-nome-admin">${usuario.nome || 'N/A'}</span> <button class="btn btn-secondary btn-sm" id="btn-editar-nome-admin" style="margin-left: 1rem;">Editar Nome</button></p>
                  Formulário de Edição de Nome (oculto) -->
                <form id="form-editar-nome-admin" style="display: none; margin-top: 0.5rem; margin-bottom: 1rem; padding: 1rem; background-color: #f8f9fa; border-radius: 0.5rem; border: 1px solid var(--cor-borda);">
                     <div id="nome-edit-error-admin" class="error-message" style="display:none; margin-bottom: 0.5rem;"></div>
                    <div class="input-group" style="margin-bottom: 0.5rem;">
                        <label for="edit-nome-admin" style="margin-bottom: 0.25rem;">Novo Nome</label>
                        <input type="text" id="edit-nome-admin" value="${usuario.nome || ''}" required minlength="3">
                    </div>
                    <div class="form-actions" style="justify-content: flex-start; gap: 0.5rem;">
                        <button type="submit" class="btn btn-success btn-sm">Salvar Nome</button>
                        <button type="button" class="btn btn-secondary btn-sm" id="btn-cancelar-edit-nome-admin">Cancelar</button>
                    </div>
                </form>
                <p><strong>Email:</strong> ${usuario.email || 'N/A'}</p>
                <p><strong>CPF:</strong> ${formatCPF(usuario.cpf) || 'N/A'}</p>
                <p><strong>Cargo:</strong> ${usuario.cargo || 'Diretor(a)'}</p>
            </div>
        </div>

         Seção de Alterar Senha -->
        <div class="section-card" style="margin-top: 1.5rem;">
            <h4>Alterar Senha</h4>
            <form id="form-alterar-senha-admin">
                <div id="senha-error-message-admin" class="error-message" style="display:none;"></div>
                <div class="input-group">
                    <label for="nova-senha-admin">Nova Senha</label>
                    <input type="password" id="nova-senha-admin" required minlength="6">
                </div>
                 <div class="password-criteria-container" style="margin-top: -0.5rem; margin-bottom: 1rem;">
                    <ul>
                        <li id="length-check-admin">Pelo menos 6 caracteres</li>
                        <li id="number-check-admin">Conter pelo menos um número</li>
                    </ul>
                </div>
                <div class="input-group">
                    <label for="confirma-senha-admin">Confirme a Nova Senha</label>
                    <input type="password" id="confirma-senha-admin" required>
                </div>
                <div class="form-actions" style="justify-content: flex-end;">
                    <button type="submit" class="btn btn-success">Salvar Nova Senha</button>
                </div>
            </form>
        </div>`;

        // Listener para o botão Editar Nome (Admin)
        const btnEditNomeAdmin = document.getElementById('btn-editar-nome-admin');
        const formEditNomeAdmin = document.getElementById('form-editar-nome-admin');
        const displayNomeAdmin = document.getElementById('display-nome-admin');

        btnEditNomeAdmin.addEventListener('click', () => {
            formEditNomeAdmin.style.display = 'block';
            btnEditNomeAdmin.style.display = 'none';
            document.getElementById('edit-nome-admin').focus();
            displayNomeAdmin.style.display = 'none';
        });

        document.getElementById('btn-cancelar-edit-nome-admin').addEventListener('click', () => {
            formEditNomeAdmin.style.display = 'none';
            btnEditNomeAdmin.style.display = 'inline-block';
            document.getElementById('edit-nome-admin').value = dadosUsuarioAtual.nome || ''; // Restaura
            document.getElementById('nome-edit-error-admin').style.display = 'none';
            displayNomeAdmin.style.display = 'inline';
        });

        // Listener para salvar o nome (Admin)
        formEditNomeAdmin.addEventListener('submit', handleUpdateNomeAdmin);


        // Listener e validação para o formulário de alterar senha (Admin)
        document.getElementById('form-alterar-senha-admin').addEventListener('submit', handleUpdatePasswordAdmin);

        const novaSenhaInputAdmin = document.getElementById('nova-senha-admin');
        const lengthCheckAdmin = document.getElementById('length-check-admin');
        const numberCheckAdmin = document.getElementById('number-check-admin');

        const validatePasswordAdmin = () => {
            const senha = novaSenhaInputAdmin.value;
            lengthCheckAdmin.classList.toggle('valid', senha.length >= 6);
            numberCheckAdmin.classList.toggle('valid', /\d/.test(senha));
        };
        novaSenhaInputAdmin.addEventListener('input', validatePasswordAdmin);
    }

    // Função para lidar com a atualização do NOME (Admin)
    async function handleUpdateNomeAdmin(event) {
        event.preventDefault();
        const nomeInput = document.getElementById('edit-nome-admin');
        const novoNome = nomeInput.value.trim();

        if (!novoNome || novoNome.length < 3) {
            showToast('O nome deve ter pelo menos 3 caracteres.', 'error');
            nomeInput.focus();
            return;
        }
        if (novoNome === dadosUsuarioAtual.nome) {
            showToast('O nome não foi alterado.', 'info');
            document.getElementById('form-editar-nome-admin').style.display = 'none';
            document.getElementById('btn-editar-nome-admin').style.display = 'inline-block';
            document.getElementById('display-nome-admin').style.display = 'inline';
            return;
        }

        const dto = { nome: novoNome }; // DTO contém apenas o nome
        const submitButton = event.target.querySelector('button[type="submit"]');
        const errorDiv = document.getElementById('nome-edit-error-admin');
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
                if (welcomeMsg) welcomeMsg.textContent = `Seja bem-vindo(a), ${dadosUsuarioAtual.nome}!`;
                renderMeuPerfil(); // Re-renderiza a seção de perfil
            } else {
                await handleApiError(response, 'nome-edit-error-admin');
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

    // Função para lidar com a atualização da SENHA (Admin)
    async function handleUpdatePasswordAdmin(event) {
        event.preventDefault();
        const novaSenhaInput = document.getElementById('nova-senha-admin');
        const confirmaSenhaInput = document.getElementById('confirma-senha-admin');
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

        const dto = { senha: novaSenha }; // DTO contém apenas a senha
        const submitButton = event.target.querySelector('button[type="submit"]');
        const errorDiv = document.getElementById('senha-error-message-admin');
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
                await handleApiError(response, 'senha-error-message-admin');
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

    // --- Funções de formatação (máscaras) ---
    function formatTelefone(value) {
        if (!value) return "";
        value = value.replace(/\D/g, ''); // Remove tudo que não é dígito
        if (value.length <= 10) { // Fixo
            value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
            value = value.replace(/(\d{4})(\d)/, "$1-$2");
        } else { // Celular
            value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
            value = value.replace(/(\d{5})(\d)/, "$1-$2");
        }
        return value.slice(0, 15); // Limita ao formato (XX) XXXXX-XXXX
    }

    function formatCEP(value) {
        if (!value) return "";
        value = value.replace(/\D/g, '');
        value = value.replace(/^(\d{5})(\d)/, "$1-$2");
        return value.slice(0, 9); // Limita ao formato XXXXX-XXX
    }

    function formatCPF(value) {
        if (!value) return "";
        value = value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        return value.slice(0, 14); // Limita ao formato XXX.XXX.XXX-XX
    }

    // --- Modal de Confirmação Genérico ---
    // (Garantir que o HTML exista em diretor_dashboard.html)
    function showConfirmationModal(message, onConfirm, confirmButtonClass = 'btn-danger') {
        const modal = document.getElementById('confirmation-modal');
        const messageP = document.getElementById('modal-message');
        const btnConfirm = document.getElementById('modal-btn-confirm');
        const btnCancel = document.getElementById('modal-btn-cancel');

        if (!modal || !messageP || !btnConfirm || !btnCancel) {
            console.warn("Elementos do modal de confirmação não encontrados. Usando confirm() nativo.");
            if (confirm(message)) {
                onConfirm();
            }
            return;
        }

        messageP.textContent = message;
        // Remove classes antigas antes de adicionar a nova
        btnConfirm.classList.remove('btn-danger', 'btn-success', 'btn-warning', 'btn-primary', 'btn-secondary');
        btnConfirm.classList.add(confirmButtonClass); // Adiciona a classe passada

        modal.style.display = 'flex';

        // AbortController para gerenciar listeners e evitar duplicidade
        const controller = new AbortController();
        const { signal } = controller;

        const cleanup = () => {
            modal.style.display = 'none';
            controller.abort(); // Remove todos os listeners associados a este sinal
        };

        // Adiciona listeners com o signal
        btnConfirm.addEventListener('click', () => { onConfirm(); cleanup(); }, { signal, once: true }); // once: true pode ser útil aqui
        btnCancel.addEventListener('click', cleanup, { signal, once: true });
        modal.addEventListener('click', (e) => { if (e.target === modal) cleanup(); }, { signal }); // Fechar clicando fora
    }


    // Inicia a execução do dashboard
    initDiretorDashboard();
});

