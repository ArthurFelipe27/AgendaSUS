// ===================================================================
// DIRETOR.JS (VERSÃO COM MELHORIAS VISUAIS)
// Implementa ícones, spinners e um layout de card aprimorado.
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    let idUsuarioLogado = null;
    const SPINNER_HTML = `<div class="spinner-container"><div class="spinner"></div></div>`;

    async function initDiretorDashboard() {
        try {
            const responseMe = await fetchAuthenticated('/api/usuarios/me');
            if (!responseMe.ok) throw new Error('Falha ao buscar perfil do admin');
            const adminUser = await responseMe.json();
            idUsuarioLogado = adminUser.id;
        } catch (e) {
            console.error(e);
            contentArea.innerHTML = "<p>Erro fatal ao carregar dados do administrador.</p>";
            return;
        }

        // [MELHORIA VISUAL] Adicionados ícones SVG aos cards do dashboard.
        contentArea.innerHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card admin" id="card-gerenciar-unidades">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building-2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
                    <span>Gerenciar Unidades</span>
                </div>
                <div class="dashboard-card admin" id="card-gerenciar-medicos">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-stethoscope"><path d="M4.8 2.3A.3.3 0 1 0 5 2a.3.3 0 0 0-.2.3"/><path d="M6.4 4c-.2.2-.2.5 0 .7l5.2 5.2c.2.2.5.2.7 0L17.6 4a.5.5 0 0 0 0-.7l-.1-.1a.5.5 0 0 0-.7 0l-4.4 4.5-4.5-4.5a.5.5 0 0 0-.7 0l-.1.1Z"/><path d="M8 13.2c0 1.3.5 2.5 1.4 3.4.9.9 2.1 1.4 3.4 1.4s2.5-.5 3.4-1.4c.9-.9 1.4-2.1 1.4-3.4"/><path d="M18.8 2.3A.3.3 0 1 0 19 2a.3.3 0 0 0-.2.3"/></svg>
                    <span>Gerenciar Médicos</span>
                </div>
                <div class="dashboard-card admin" id="card-gerenciar-usuarios">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users-round"><path d="M18 21a8 8 0 0 0-12 0"/><circle cx="12" cy="8" r="5"/><path d="M22 21a8 8 0 0 0-4-4"/><circle cx="6" cy="8" r="5"/><path d="M2 21a8 8 0 0 1 4-4"/></svg>
                    <span>Gerenciar Usuários</span>
                </div>
                <div class="dashboard-card admin" id="card-gerenciar-conteudo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-check-2"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v16Z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
                    <span>Gerenciar Conteúdo</span>
                </div>
                <div class="dashboard-card" id="card-meu-perfil">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
                    <span>Meu Perfil</span>
                </div>
                <div class="dashboard-card" id="card-noticias">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    <span>Ver Notícias Públicas</span>
                </div>
            </div>
            <hr>
            <div id="diretor-content-dinamico"></div> 
        `;
        document.getElementById('card-gerenciar-unidades').addEventListener('click', renderGerenciadorDeUnidades);
        document.getElementById('card-gerenciar-medicos').addEventListener('click', renderGerenciadorDeMedicos);
        document.getElementById('card-gerenciar-usuarios').addEventListener('click', renderGerenciadorDeUsuarios);
        document.getElementById('card-gerenciar-conteudo').addEventListener('click', renderGerenciadorDeConteudo);
        document.getElementById('card-meu-perfil').addEventListener('click', renderMeuPerfil);
        document.getElementById('card-noticias').addEventListener('click', () => {
            document.getElementById('diretor-content-dinamico').innerHTML = `
                <div class="admin-section-header"><h3>Notícias e Artigos Públicos</h3></div>
                <div id="public-news-container"></div>
            `;
            renderNoticiasPublicas('public-news-container');
        });

        renderGerenciadorDeUnidades();
    }

    async function renderGerenciadorDeUnidades() {
        const adminContent = document.getElementById('diretor-content-dinamico');
        adminContent.innerHTML = `
            <div class="admin-section-header">
                <h4>Unidades de Saúde</h4>
                <button class="btn btn-new" id="btn-nova-unidade">+ Nova Unidade</button>
            </div>
            <div id="unidade-form-container" style="display: none; margin-bottom: 1.5rem;"></div>
            <div id="lista-unidades" class="admin-table-container">${SPINNER_HTML}</div>
        `;
        document.getElementById('btn-nova-unidade').addEventListener('click', () => {
            const formContainer = document.getElementById('unidade-form-container');
            if (formContainer.style.display === 'none') {
                renderFormCadastroUnidade();
                formContainer.style.display = 'block';
            } else {
                formContainer.style.display = 'none';
            }
        });
        await carregarListaUnidades();
    }

    function renderFormCadastroUnidade() {
        const formContainer = document.getElementById('unidade-form-container');
        const regioesAdmin = ["Plano Piloto", "Gama", "Taguatinga", "Brazlândia", "Sobradinho", "Planaltina", "Paranoá", "Núcleo Bandeirante", "Ceilândia", "Guará", "Cruzeiro", "Samambaia", "Santa Maria", "São Sebastião", "Recanto das Emas", "Lago Sul", "Riacho Fundo", "Lago Norte", "Candangolândia", "Águas Claras", "Riacho Fundo II", "Sudoeste/Octogonal", "Varjão", "Park Way", "SCIA (Estrutural)", "Sobradinho II", "Jardim Botânico", "Itapoã", "SIA", "Vicente Pires", "Fercal", "Sol Nascente/Pôr do Sol", "Arniqueira"];
        let optionsHtml = '<option value="" disabled selected>Selecione...</option>';
        regioesAdmin.sort().forEach(ra => { optionsHtml += `<option value="${ra}">${ra}</option>`; });

        formContainer.innerHTML = `
        <div class="booking-form-container">
            <h5>Cadastrar Nova Unidade</h5>
            <form id="form-cad-unidade">
                <div id="unidade-error-message" class="error-message" style="display:none;"></div>
                <div class="input-group"><label>Nome da Unidade</label><input type="text" id="unidade-nome" required></div>
                <div class="input-group"><label>Endereço</label><input type="text" id="unidade-endereco" required></div>
                <div class="input-group"><label>Região Administrativa</label><select id="unidade-ra" required>${optionsHtml}</select></div>
                <div class="input-group"><label>CEP</label><input type="text" id="unidade-cep" placeholder="Apenas números" required maxlength="8"></div>
                <div class="input-group"><label>Telefone</label><input type="text" id="unidade-telefone"></div>
                <button type="submit" class="btn btn-success">Salvar Unidade</button>
            </form>
        </div>`;
        document.getElementById('form-cad-unidade').addEventListener('submit', handleCadastroUnidadeSubmit);
    }

    async function carregarListaUnidades() {
        try {
            const response = await fetchAuthenticated('/api/unidades-saude');
            if (!response || !response.ok) throw new Error('Falha ao buscar unidades');
            const unidades = await response.json();
            const container = document.getElementById('lista-unidades');

            let tableHTML = `<table class="admin-table"><thead><tr><th>ID</th><th>Nome</th><th>Região Administrativa</th></tr></thead><tbody>`;
            if (unidades.length === 0) {
                tableHTML += '<tr><td colspan="3">Nenhuma unidade cadastrada.</td></tr>';
            } else {
                unidades.forEach(u => tableHTML += `<tr><td>${u.id}</td><td>${u.nome}</td><td>${u.regiaoAdministrativa}</td></tr>`);
            }
            tableHTML += '</tbody></table>';
            container.innerHTML = tableHTML;
        } catch (err) {
            console.error(err);
            document.getElementById('lista-unidades').innerHTML = '<p>Erro ao carregar unidades.</p>';
        }
    }

    async function handleCadastroUnidadeSubmit(event) {
        event.preventDefault();
        const dados = {
            nome: document.getElementById('unidade-nome').value,
            endereco: document.getElementById('unidade-endereco').value,
            regiaoAdministrativa: document.getElementById('unidade-ra').value,
            cep: document.getElementById('unidade-cep').value,
            telefone: document.getElementById('unidade-telefone').value
        };
        try {
            const response = await fetchAuthenticated('/api/unidades-saude', { method: 'POST', body: JSON.stringify(dados) });
            if (response && response.ok) {
                showToast('Unidade cadastrada com sucesso!', 'success');
                document.getElementById('unidade-form-container').style.display = 'none';
                await carregarListaUnidades();
            } else {
                await handleApiError(response, 'unidade-error-message');
            }
        } catch (err) { showToast('Erro de rede.', 'error'); }
    }

    async function renderGerenciadorDeMedicos() {
        const adminContent = document.getElementById('diretor-content-dinamico');
        adminContent.innerHTML = `
            <div class="admin-section-header"><h4>Médicos do Sistema</h4><button class="btn btn-new" id="btn-novo-medico">+ Novo Médico</button></div>
            <div id="medico-form-container" style="display: none; margin-bottom: 1.5rem;"></div>
            <div id="lista-medicos" class="admin-table-container">${SPINNER_HTML}</div>`;
        document.getElementById('btn-novo-medico').addEventListener('click', async () => {
            const formContainer = document.getElementById('medico-form-container');
            if (formContainer.style.display === 'none') {
                try {
                    const responseUnidades = await fetchAuthenticated('/api/unidades-saude');
                    if (!responseUnidades || !responseUnidades.ok) throw new Error('Cadastre uma unidade de saúde primeiro.');
                    const unidades = await responseUnidades.json();
                    renderFormCadastroMedico(unidades);
                    formContainer.style.display = 'block';
                } catch (err) { showToast(err.message, 'error'); }
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
            let tableHTML = `<table class="admin-table"><thead><tr><th>ID</th><th>Nome</th><th>Especialidade</th><th>Unidade</th><th>Ativo?</th><th>Ações</th></tr></thead><tbody>`;
            if (medicos.length === 0) {
                tableHTML += '<tr><td colspan="6">Nenhum médico cadastrado.</td></tr>';
            } else {
                medicos.forEach(medico => {
                    tableHTML += `<tr><td>${medico.id}</td><td>${medico.nome}</td><td>${medico.especialidade.replace(/_/g, ' ')}</td><td>${medico.unidade ? medico.unidade.nome : 'N/A'}</td><td>${medico.ativo ? 'Sim' : 'Não'}</td><td><button class="btn btn-danger btn-toggle-medico" data-medico-id="${medico.id}" data-medico-nome="${medico.nome}" data-ativo="${medico.ativo}">${medico.ativo ? 'Desativar' : 'Reativar'}</button></td></tr>`;
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
        if (unidades.length === 0) {
            optionsUnidades = '<option value="" disabled>Cadastre uma unidade primeiro</option>';
        } else {
            unidades.forEach(u => optionsUnidades += `<option value="${u.id}">${u.nome}</option>`);
        }
        formContainer.innerHTML = `
            <div class="booking-form-container">
                <h5>Cadastrar Novo Médico</h5>
                <form id="form-cad-medico">
                    <div id="admin-med-error" class="error-message" style="display: none;"></div>
                    <div class="input-group"><label>Unidade de Saúde</label><select id="med-unidade" required>${optionsUnidades}</select></div>
                    <div class="input-group"><label>Nome</label><input type="text" id="med-nome" required></div>
                    <div class="input-group"><label>Email</label><input type="email" id="med-email" required></div>
                    <div class="input-group"><label>CPF</label><input type="text" id="med-cpf" required maxlength="11"></div>
                    <div class="input-group"><label>CRM</label><input type="text" id="med-crm" required></div>
                    <div class="input-group"><label>Especialidade</label><select id="med-especialidade" required><option value="" disabled selected>Selecione...</option><option value="CLINICA_GERAL">Clínica Médica (Geral)</option><option value="MEDICINA_FAMILIA_COMUNIDADE">Medicina de Família</option><option value="PEDIATRIA">Pediatria</option><option value="GINECOLOGIA_OBSTETRICIA">Ginecologia e Obstetrícia</option><option value="DERMATOLOGIA">Dermatologia</option><option value="CARDIOLOGIA">Cardiologia</option><option value="PSIQUIATRIA">Psiquiatria</option><option value="ODONTOLOGIA">Odontologia</option><option value="ENFERMAGEM">Enfermagem</option></select></div>
                    <div class="input-group"><label>Senha</label><input type="password" id="med-senha" required minlength="6"></div>
                    <button type="submit" class="btn btn-success">Cadastrar Médico</button>
                </form>
            </div>`;
        document.getElementById('form-cad-medico').addEventListener('submit', handleCadastroMedicoSubmit);
    }

    async function handleCadastroMedicoSubmit(event) {
        event.preventDefault();
        const dadosMedico = {
            nome: document.getElementById('med-nome').value, email: document.getElementById('med-email').value,
            cpf: document.getElementById('med-cpf').value, crm: document.getElementById('med-crm').value,
            especialidade: document.getElementById('med-especialidade').value, senha: document.getElementById('med-senha').value,
            idUnidade: parseInt(document.getElementById('med-unidade').value)
        };
        if (isNaN(dadosMedico.idUnidade)) {
            handleApiError({ json: () => Promise.resolve({ message: 'Selecione uma unidade de saúde.' }) }, 'admin-med-error');
            return;
        }
        try {
            const response = await fetchAuthenticated('/api/medicos', { method: 'POST', body: JSON.stringify(dadosMedico) });
            if (response && response.ok) {
                showToast('Médico cadastrado com sucesso!', 'success');
                document.getElementById('medico-form-container').style.display = 'none';
                await carregarTabelaMedicos();
            } else { await handleApiError(response, 'admin-med-error'); }
        } catch (err) { showToast('Erro de rede.', 'error'); }
    }

    async function handleToggleAtivacaoMedico(medicoId, medicoNome, isAtivo) {
        const acao = isAtivo ? 'desativar' : 'reativar';
        if (!confirm(`Tem certeza que deseja ${acao} o(a) médico(a) ${medicoNome}?`)) return;
        try {
            const dto = { ativo: !isAtivo };
            const response = await fetchAuthenticated(`/api/medicos/${medicoId}`, { method: 'PUT', body: JSON.stringify(dto) });
            if (response && response.ok) {
                showToast(`Médico ${isAtivo ? 'desativado' : 'reativado'}!`, 'success');
                await carregarTabelaMedicos();
            } else { await handleApiError(response, null); }
        } catch (err) { showToast('Erro de rede.', 'error'); }
    }

    async function renderGerenciadorDeUsuarios() {
        const adminContent = document.getElementById('diretor-content-dinamico');
        adminContent.innerHTML = `<div class="admin-section-header"><h4>Usuários do Sistema</h4></div><div id="admin-user-list-container">${SPINNER_HTML}</div>`;
        try {
            const response = await fetchAuthenticated('/api/usuarios');
            if (!response || !response.ok) throw new Error('Falha ao buscar usuários');
            const usuarios = await response.json();
            document.getElementById('admin-user-list-container').innerHTML = renderUserTable(usuarios);
            document.querySelectorAll('.btn-desativar-user').forEach(button => {
                button.addEventListener('click', async e => { if (confirm(`Desativar: ${e.target.dataset.userName}?`)) await handleDesativarUsuario(e.target.dataset.userId); });
            });
        } catch (err) { console.error(err); adminContent.innerHTML = `<p>Erro ao carregar usuários.</p>`; }
    }

    function renderUserTable(usuarios) {
        let tableHTML = `<div class="admin-table-container"><table class="admin-table"><thead><tr><th>ID</th><th>Nome</th><th>Email</th><th>Perfil</th><th>Ativo?</th><th>Ações</th></tr></thead><tbody>`;
        usuarios.forEach(user => {
            const isSelf = (user.id === idUsuarioLogado);
            tableHTML += `<tr><td>${user.id}</td><td>${user.nome}</td><td>${user.email}</td><td>${user.role}</td><td>${user.ativo ? 'Sim' : 'Não'}</td><td><button class="btn btn-danger btn-desativar-user" data-user-id="${user.id}" data-user-name="${user.nome}" ${isSelf ? 'disabled title="Não pode desativar a si mesmo"' : ''}>Desativar</button></td></tr>`;
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    async function handleDesativarUsuario(userId) {
        try {
            const response = await fetchAuthenticated(`/api/usuarios/${userId}`, { method: 'DELETE' });
            if (response && response.ok) {
                showToast('Usuário desativado com sucesso!', 'success');
                renderGerenciadorDeUsuarios();
            } else { const error = await response.json(); showToast(`Falha ao desativar: ${error.message}`, 'error'); }
        } catch (err) { showToast('Erro ao tentar desativar.', 'error'); }
    }

    async function renderGerenciadorDeConteudo() {
        const adminContent = document.getElementById('diretor-content-dinamico');
        adminContent.innerHTML = `<div class="admin-section-header"><h4>Moderação de Conteúdo</h4></div><div id="admin-content-list">${SPINNER_HTML}</div>`;
        try {
            const response = await fetchAuthenticated('/api/conteudo/admin/todos');
            if (!response || !response.ok) throw new Error('Falha ao buscar conteúdo');
            const conteudos = await response.json();
            let tableHTML = `<table class="admin-table"><thead><tr><th>ID</th><th>Título</th><th>Autor</th><th>Status</th><th>Ações</th></tr></thead><tbody>`;
            if (conteudos.length === 0) {
                tableHTML += `<tr><td colspan="5">Nenhum conteúdo para moderar.</td></tr>`;
            } else {
                conteudos.forEach(c => {
                    let acoes = '';
                    if (c.status === 'RASCUNHO') { acoes = `<button class="btn btn-success btn-aprovar-conteudo" data-id="${c.id}">Aprovar</button><button class="btn btn-danger btn-deletar-conteudo" data-id="${c.id}" style="margin-left: 0.5rem;">Deletar</button>`; }
                    else if (c.status === 'PUBLICADO') { acoes = `<button class="btn btn-secondary btn-desativar-conteudo" data-id="${c.id}">Desativar</button>`; }
                    else { acoes = `<button class="btn btn-danger btn-deletar-conteudo" data-id="${c.id}">Deletar</button>`; }
                    tableHTML += `<tr><td>${c.id}</td><td>${c.titulo}</td><td>${c.autor.nome}</td><td><span class="badge ${c.status}">${c.status}</span></td><td>${acoes}</td></tr>`;
                });
            }
            tableHTML += `</tbody></table>`;
            document.getElementById('admin-content-list').innerHTML = tableHTML;
            document.querySelectorAll('.btn-aprovar-conteudo').forEach(btn => btn.addEventListener('click', () => handleUpdateConteudoStatus(btn.dataset.id, 'PUBLICADO')));
            document.querySelectorAll('.btn-desativar-conteudo').forEach(btn => btn.addEventListener('click', () => handleUpdateConteudoStatus(btn.dataset.id, 'DESATIVADO')));
            document.querySelectorAll('.btn-deletar-conteudo').forEach(btn => btn.addEventListener('click', () => handleDeletarConteudo(btn.dataset.id)));
        } catch (err) { console.error(err); adminContent.innerHTML = `<p>Erro ao carregar conteúdo.</p>`; }
    }

    async function handleUpdateConteudoStatus(conteudoId, novoStatus) {
        if (!confirm(`Alterar status para ${novoStatus}?`)) return;
        const dto = { status: novoStatus };
        try {
            const response = await fetchAuthenticated(`/api/conteudo/admin/${conteudoId}`, { method: 'PUT', body: JSON.stringify(dto) });
            if (response && response.ok) { showToast(`Conteúdo atualizado!`, 'success'); renderGerenciadorDeConteudo(); }
            else { await handleApiError(response, 'diretor-content-dinamico'); }
        } catch (err) { showToast('Erro de rede.', 'error'); }
    }

    async function handleDeletarConteudo(conteudoId) {
        if (!confirm(`DELETAR PERMANENTEMENTE este conteúdo?`)) return;
        try {
            const response = await fetchAuthenticated(`/api/conteudo/admin/${conteudoId}`, { method: 'DELETE' });
            if (response && response.ok) { showToast(`Conteúdo deletado!`, 'success'); renderGerenciadorDeConteudo(); }
            else { await handleApiError(response, 'diretor-content-dinamico'); }
        } catch (err) { showToast('Erro de rede.', 'error'); }
    }

    function renderMeuPerfil() {
        const contentDinamico = document.getElementById('diretor-content-dinamico');
        contentDinamico.innerHTML = `<h3>Meu Perfil</h3><div id="perfil-info" class="document-item">${SPINNER_HTML}</div><hr><h4>Alterar Senha</h4><div class="booking-form-container"><form id="form-alterar-senha"><div id="senha-error-message" class="error-message" style="display:none;"></div><div class="input-group"><label for="nova-senha">Nova Senha</label><input type="password" id="nova-senha" required minlength="6"></div><div class="input-group"><label for="confirma-senha">Confirme</label><input type="password" id="confirma-senha" required></div><div class="form-actions"><button type="submit" class="btn btn-success">Salvar Nova Senha</button></div></form></div>`;
        try {
            fetchAuthenticated('/api/usuarios/me').then(response => response.json()).then(usuario => {
                document.getElementById('perfil-info').innerHTML = `<p><strong>Nome:</strong> ${usuario.nome}</p><p><strong>Email:</strong> ${usuario.email}</p><p><strong>CPF:</strong> ${usuario.cpf}</p>`;
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
            const response = await fetchAuthenticated(`/api/usuarios/${idUsuarioLogado}`, { method: 'PUT', body: JSON.stringify(dto) });
            if (response && response.ok) {
                showToast('Senha alterada! Você será deslogado.', 'success');
                setTimeout(logout, 2000);
            } else { await handleApiError(response, 'senha-error-message'); }
        } catch (err) { showToast('Erro de rede ao alterar senha.', 'error'); }
    }

    initDiretorDashboard();
});
