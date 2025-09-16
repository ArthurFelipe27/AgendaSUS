// ===================================================================
// DIRETOR.JS (VERSÃO FINAL E COMPLETA)
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores e Variáveis Globais ---
    const contentArea = document.getElementById('content-area');
    let idUsuarioLogado = null; // Armazena o ID do diretor logado

    // --- FUNÇÃO DE INICIALIZAÇÃO ---

    /**
     * Função principal que constrói o dashboard do diretor
     */
    async function initDiretorDashboard() {
        try {
            const responseMe = await fetchAuthenticated('/api/usuarios/me');
            if (!responseMe.ok) throw new Error('Falha ao buscar perfil do admin');
            const adminUser = await responseMe.json();
            idUsuarioLogado = adminUser.id;
            renderDashboardDiretor(); // Renderiza o painel principal após pegar o ID
        } catch (e) {
            console.error(e);
            contentArea.innerHTML = "<p>Erro fatal ao carregar dados do administrador.</p>";
        }
    }

    /**
     * Renderiza a estrutura principal do dashboard com os cards de navegação
     */
    function renderDashboardDiretor() {
        contentArea.innerHTML = `
            <h3>Painel Administrativo</h3>
            <div class="dashboard-grid">
                <div class="dashboard-card admin" id="card-gerenciar-unidades">Gerenciar Unidades</div>
                <div class="dashboard-card admin" id="card-gerenciar-medicos">Gerenciar Médicos</div>
                <div class="dashboard-card admin" id="card-gerenciar-usuarios">Gerenciar Usuários</div>
                <div class="dashboard-card admin" id="card-gerenciar-conteudo">Gerenciar Conteúdo</div>
                <div class="dashboard-card admin" id="card-meu-perfil">Meu Perfil</div>
            </div>
            <hr>
            <div id="diretor-content-dinamico"></div> 
        `;

        // Adiciona os listeners de clique para cada card
        document.getElementById('card-gerenciar-unidades').addEventListener('click', renderGerenciadorDeUnidades);
        document.getElementById('card-gerenciar-medicos').addEventListener('click', renderGerenciadorDeMedicos);
        document.getElementById('card-gerenciar-usuarios').addEventListener('click', renderGerenciadorDeUsuarios);
        document.getElementById('card-gerenciar-conteudo').addEventListener('click', renderGerenciadorDeConteudo);
        document.getElementById('card-meu-perfil').addEventListener('click', renderMeuPerfil);
    }

    // --- SEÇÃO 1: GERENCIAR UNIDADES DE SAÚDE ---

    async function renderGerenciadorDeUnidades() {
        const adminContent = document.getElementById('diretor-content-dinamico');
        adminContent.innerHTML = `
            <h4>Gerenciamento de Unidades de Saúde</h4>
            <div class="admin-form-container">
                <div>
                    <h5>Cadastrar Nova Unidade</h5>
                    <form id="form-cad-unidade" class="login-form" style="padding: 0; box-shadow: none;">
                        <div id="unidade-error-message" class="error-message" style="display: none;"></div>
                        <div class="input-group"><label>Nome da Unidade</label><input type="text" id="unidade-nome" required></div>
                        <div class="input-group"><label>Endereço</label><input type="text" id="unidade-endereco" required></div>
                        <div class="input-group"><label>Cidade</label><input type="text" id="unidade-cidade" required></div>
                        <div class="input-group"><label>UF</label><input type="text" id="unidade-uf" required maxlength="2"></div>
                        <div class="input-group"><label>CEP</label><input type="text" id="unidade-cep" required maxlength="8"></div>
                        <div class="input-group"><label>Telefone</label><input type="text" id="unidade-telefone"></div>
                        <button type="submit" class="btn-login">Cadastrar Unidade</button>
                    </form>
                </div>
                <div>
                    <h5>Unidades Cadastradas</h5>
                    <div id="lista-unidades" class="admin-table-container">Carregando...</div>
                </div>
            </div>
        `;
        document.getElementById('form-cad-unidade').addEventListener('submit', handleCadastroUnidadeSubmit);
        await carregarListaUnidades();
    }

    async function carregarListaUnidades() {
        try {
            const response = await fetchAuthenticated('/api/unidades-saude');
            if (!response.ok) throw new Error('Falha ao buscar unidades');
            const unidades = await response.json();
            const container = document.getElementById('lista-unidades');
            let tableHTML = `<table class="admin-table"><thead><tr><th>ID</th><th>Nome</th><th>Cidade/UF</th></tr></thead><tbody>`;
            if (unidades.length === 0) {
                tableHTML += '<tr><td colspan="3">Nenhuma unidade cadastrada.</td></tr>';
            } else {
                unidades.forEach(u => {
                    tableHTML += `<tr><td>${u.id}</td><td>${u.nome}</td><td>${u.cidade}/${u.uf}</td></tr>`;
                });
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
            cidade: document.getElementById('unidade-cidade').value,
            uf: document.getElementById('unidade-uf').value.toUpperCase(),
            cep: document.getElementById('unidade-cep').value,
            telefone: document.getElementById('unidade-telefone').value
        };
        try {
            const response = await fetchAuthenticated('/api/unidades-saude', { method: 'POST', body: JSON.stringify(dados) });
            if (response.ok) {
                showToast('Unidade cadastrada com sucesso!', 'success');
                document.getElementById('form-cad-unidade').reset();
                await carregarListaUnidades();
            } else {
                await handleApiError(response, 'unidade-error-message');
            }
        } catch (err) {
            showToast('Erro de rede ao cadastrar unidade.', 'error');
        }
    }

    // --- SEÇÃO 2: GERENCIAR MÉDICOS ---

    async function renderGerenciadorDeMedicos() {
        const adminContent = document.getElementById('diretor-content-dinamico');
        adminContent.innerHTML = `<h4>Gerenciamento de Médicos</h4><p>Carregando dados...</p>`;
        try {
            const responseUnidades = await fetchAuthenticated('/api/unidades-saude');
            if (!responseUnidades.ok) throw new Error('Falha ao carregar unidades de saúde.');
            const unidades = await responseUnidades.json();
            renderFormCadastroMedico(unidades);
        } catch (err) {
            console.error(err);
            adminContent.innerHTML = `<p>Erro: ${err.message}. Cadastre uma unidade de saúde primeiro.</p>`;
        }
    }

    function renderFormCadastroMedico(unidades) {
        const adminContent = document.getElementById('diretor-content-dinamico');
        let optionsUnidades = '<option value="" disabled selected>Selecione uma unidade</option>';
        if (unidades.length > 0) {
            unidades.forEach(u => {
                optionsUnidades += `<option value="${u.id}">${u.nome} - ${u.cidade}/${u.uf}</option>`;
            });
        }
        adminContent.innerHTML = `
            <h4>Cadastrar Novo Médico</h4>
            <form id="form-cad-medico" class="login-form" style="padding: 0; box-shadow: none;">
                <div id="admin-med-error" class="error-message" style="display: none;"></div>
                <div class="input-group"><label>Unidade de Saúde</label><select id="med-unidade" required>${optionsUnidades}</select></div>
                <div class="input-group"><label>Nome</label><input type="text" id="med-nome" required></div>
                <div class="input-group"><label>Email</label><input type="email" id="med-email" required></div>
                <div class="input-group"><label>CPF</label><input type="text" id="med-cpf" required maxlength="11"></div>
                <div class="input-group"><label>CRM</label><input type="text" id="med-crm" required></div>
                <div class="input-group"><label>Especialidade</label><input type="text" id="med-especialidade" required></div>
                <div class="input-group"><label>Senha</label><input type="password" id="med-senha" required minlength="6"></div>
                <button type="submit" class="btn-login">Cadastrar Médico</button>
            </form>
        `;
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
            handleApiError({ message: 'Selecione uma unidade de saúde.' }, 'admin-med-error');
            return;
        }
        try {
            const response = await fetchAuthenticated('/api/medicos', { method: 'POST', body: JSON.stringify(dadosMedico) });
            if (response.ok) {
                showToast('Médico cadastrado com sucesso!', 'success');
                document.getElementById('form-cad-medico').reset();
            } else {
                await handleApiError(response, 'admin-med-error');
            }
        } catch (err) {
            showToast('Erro de rede ao cadastrar médico.', 'error');
        }
    }

    // --- SEÇÃO 3: GERENCIAR USUÁRIOS ---

    async function renderGerenciadorDeUsuarios() {
        const adminContent = document.getElementById('diretor-content-dinamico');
        adminContent.innerHTML = `<h4>Gerenciamento de Usuários</h4><div id="admin-user-list-container">Carregando...</div>`;
        try {
            const response = await fetchAuthenticated('/api/usuarios');
            if (!response || !response.ok) throw new Error('Falha ao buscar usuários');
            const usuarios = await response.json();
            document.getElementById('admin-user-list-container').innerHTML = renderUserTable(usuarios);
            document.querySelectorAll('.btn-delete-user').forEach(button => {
                button.addEventListener('click', async e => {
                    if (confirm(`Desativar: ${e.target.dataset.userName}?`)) await handleDesativarUsuario(e.target.dataset.userId);
                });
            });
        } catch (err) { console.error(err); adminContent.innerHTML = `<p>Erro ao carregar usuários.</p>`; }
    }

    function renderUserTable(usuarios) {
        let tableHTML = `<div class="admin-table-container"><table class="admin-table"><thead><tr><th>ID</th><th>Nome</th><th>Email</th><th>Perfil</th><th>Ativo?</th><th>Ações</th></tr></thead><tbody>`;
        usuarios.forEach(user => {
            const isSelf = (user.id === idUsuarioLogado);
            tableHTML += `<tr><td>${user.id}</td><td>${user.nome}</td><td>${user.email}</td><td>${user.role}</td><td>${user.ativo ? 'Sim' : 'Não'}</td><td><button class="btn-delete btn-delete-user" data-user-id="${user.id}" data-user-name="${user.nome}" ${isSelf ? 'disabled title="Não pode desativar a si mesmo"' : ''}>Desativar</button></td></tr>`;
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    async function handleDesativarUsuario(userId) {
        try {
            const response = await fetchAuthenticated(`/api/usuarios/${userId}`, { method: 'DELETE' });
            if (response.ok) {
                showToast('Usuário desativado com sucesso!', 'success');
                renderGerenciadorDeUsuarios();
            } else {
                const error = await response.json();
                showToast(`Falha ao desativar: ${error.message}`, 'error');
            }
        } catch (err) { showToast('Erro ao tentar desativar.', 'error'); }
    }

    // --- SEÇÃO 4: GERENCIAR CONTEÚDO ---

    async function renderGerenciadorDeConteudo() {
        const adminContent = document.getElementById('diretor-content-dinamico');
        adminContent.innerHTML = `<h4>Moderação de Conteúdo</h4><div id="admin-content-list">Carregando...</div>`;
        try {
            const response = await fetchAuthenticated('/api/conteudo/admin/todos');
            if (!response.ok) throw new Error('Falha ao buscar conteúdo');
            const conteudos = await response.json();
            let tableHTML = `<table class="admin-table"><thead><tr><th>ID</th><th>Título</th><th>Autor</th><th>Status</th><th>Ações</th></tr></thead><tbody>`;
            if (conteudos.length === 0) {
                tableHTML += `<tr><td colspan="5">Nenhum conteúdo para moderar.</td></tr>`;
            } else {
                conteudos.forEach(c => {
                    let acoes = '';
                    if (c.status === 'RASCUNHO') { acoes = `<button class="btn-confirm btn-aprovar-conteudo" data-id="${c.id}">Aprovar</button><button class="btn-delete btn-deletar-conteudo" data-id="${c.id}" style="margin-left: 0.5rem;">Deletar</button>`; }
                    else if (c.status === 'PUBLICADO') { acoes = `<button class="btn-cancel btn-desativar-conteudo" data-id="${c.id}">Desativar</button>`; }
                    else { acoes = `<button class="btn-delete btn-deletar-conteudo" data-id="${c.id}">Deletar</button>`; }
                    tableHTML += `<tr><td>${c.id}</td><td>${c.titulo}</td><td>${c.autor.nome}</td><td>${c.status}</td><td>${acoes}</td></tr>`;
                });
            }
            tableHTML += `</tbody></table>`;
            adminContent.innerHTML = `<h4>Moderação de Conteúdo</h4>${tableHTML}`;
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
            if (response.ok) { showToast(`Conteúdo atualizado!`, 'success'); renderGerenciadorDeConteudo(); }
            else { await handleApiError(response, 'diretor-content-dinamico'); }
        } catch (err) { showToast('Erro de rede.', 'error'); }
    }

    async function handleDeletarConteudo(conteudoId) {
        if (!confirm(`DELETAR PERMANENTEMENTE este conteúdo?`)) return;
        try {
            const response = await fetchAuthenticated(`/api/conteudo/admin/${conteudoId}`, { method: 'DELETE' });
            if (response.ok) { showToast(`Conteúdo deletado!`, 'success'); renderGerenciadorDeConteudo(); }
            else { await handleApiError(response, 'diretor-content-dinamico'); }
        } catch (err) { showToast('Erro de rede.', 'error'); }
    }

    // --- SEÇÃO 5: MEU PERFIL ---

    function renderMeuPerfil() {
        const contentDinamico = document.getElementById('diretor-content-dinamico');
        contentDinamico.innerHTML = `<h3>Meu Perfil</h3><div id="perfil-info" class="document-item">Carregando...</div><hr><h4>Alterar Senha</h4><div class="booking-form-container"><form id="form-alterar-senha"><div id="senha-error-message" class="error-message" style="display:none;"></div><div class="input-group"><label for="nova-senha">Nova Senha</label><input type="password" id="nova-senha" required minlength="6"></div><div class="input-group"><label for="confirma-senha">Confirme</label><input type="password" id="confirma-senha" required></div><div class="form-actions"><button type="submit" class="btn-confirm">Salvar</button></div></form></div>`;
        fetchAuthenticated('/api/usuarios/me').then(response => response.json()).then(usuario => {
            document.getElementById('perfil-info').innerHTML = `<p><strong>Nome:</strong> ${usuario.nome}</p><p><strong>Email:</strong> ${usuario.email}</p><p><strong>CPF:</strong> ${usuario.cpf}</p>`;
        });
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

    // --- Inicializa o Dashboard ---
    initDiretorDashboard();
});