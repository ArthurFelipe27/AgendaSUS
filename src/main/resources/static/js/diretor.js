document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    let idUsuarioLogado = null;

    async function initDiretorDashboard() {
        try {
            const responseMe = await fetchAuthenticated('/api/usuarios/me');
            if (!responseMe.ok) throw new Error('Falha ao buscar perfil do admin');
            const adminUser = await responseMe.json();
            idUsuarioLogado = adminUser.id;
            renderDashboardDiretor();
        } catch (e) {
            console.error(e);
            contentArea.innerHTML = "<p>Erro fatal ao carregar dados do administrador.</p>";
        }
    }

    function renderDashboardDiretor() {
        contentArea.innerHTML = `
            <h3>Painel Administrativo</h3>
            <div class="dashboard-grid">
                <div class="dashboard-card admin" id="card-gerenciar-medicos">Gerenciar Médicos</div>
                <div class="dashboard-card admin" id="card-gerenciar-usuarios">Gerenciar Usuários</div>
                <div class="dashboard-card admin" id="card-gerenciar-conteudo">Gerenciar Conteúdo</div>
                <div class="dashboard-card admin" id="card-noticias">Ver Notícias Públicas</div> </div>
            </div>
            <hr>
            <div id="diretor-content-dinamico"></div> 
        `;

        document.getElementById('card-gerenciar-medicos').addEventListener('click', renderFormCadastroMedico);
        document.getElementById('card-gerenciar-usuarios').addEventListener('click', renderGerenciadorDeUsuarios);
        document.getElementById('card-gerenciar-conteudo').addEventListener('click', renderGerenciadorDeConteudo);
        document.getElementById('card-noticias').addEventListener('click', () => renderNoticiasPublicas('diretor-content-dinamico'));
    }

    // --- Funções: Gerenciar Conteúdo (NOVAS) ---
    async function renderGerenciadorDeConteudo() {
        const adminContent = document.getElementById('diretor-content-dinamico');
        adminContent.innerHTML = `<h4>Moderação de Conteúdo</h4><div id="admin-content-list">Carregando...</div>`;

        try {
            const response = await fetchAuthenticated('/api/conteudo/admin/todos');
            if (!response.ok) throw new Error('Falha ao buscar conteúdo');

            const conteudos = await response.json();

            let tableHTML = `
                <table class="admin-table">
                    <thead><tr><th>ID</th><th>Título</th><th>Autor</th><th>Status</th><th>Ações</th></tr></thead>
                    <tbody>`;

            if (conteudos.length === 0) {
                tableHTML += `<tr><td colspan="5">Nenhum conteúdo para moderar.</td></tr>`;
            } else {
                conteudos.forEach(c => {
                    let acoes = '';
                    if (c.status === 'RASCUNHO') {
                        acoes = `<button class="btn-confirm btn-aprovar-conteudo" data-id="${c.id}">Aprovar</button>
                                 <button class="btn-delete btn-deletar-conteudo" data-id="${c.id}" style="margin-left: 0.5rem;">Deletar</button>`;
                    } else if (c.status === 'PUBLICADO') {
                        acoes = `<button class="btn-cancel btn-desativar-conteudo" data-id="${c.id}">Desativar</button>`;
                    } else { // DESATIVADO
                        acoes = `<button class="btn-delete btn-deletar-conteudo" data-id="${c.id}">Deletar</button>`;
                    }

                    tableHTML += `
                        <tr>
                            <td>${c.id}</td><td>${c.titulo}</td><td>${c.autor.nome}</td><td>${c.status}</td><td>${acoes}</td>
                        </tr>`;
                });
            }
            tableHTML += `</tbody></table>`;
            document.getElementById('admin-content-list').innerHTML = tableHTML;

            // Adiciona listeners aos botões
            document.querySelectorAll('.btn-aprovar-conteudo').forEach(btn => btn.addEventListener('click', () => handleUpdateConteudoStatus(btn.dataset.id, 'PUBLICADO')));
            document.querySelectorAll('.btn-desativar-conteudo').forEach(btn => btn.addEventListener('click', () => handleUpdateConteudoStatus(btn.dataset.id, 'DESATIVADO')));
            document.querySelectorAll('.btn-deletar-conteudo').forEach(btn => btn.addEventListener('click', () => handleDeletarConteudo(btn.dataset.id)));

        } catch (err) {
            console.error(err);
            adminContent.innerHTML = `<p>Erro ao carregar conteúdo.</p>`;
        }
    }

    async function handleUpdateConteudoStatus(conteudoId, novoStatus) {
        if (!confirm(`Tem certeza que deseja alterar o status deste conteúdo para ${novoStatus}?`)) return;
        const dto = { status: novoStatus };
        try {
            const response = await fetchAuthenticated(`/api/conteudo/admin/${conteudoId}`, { method: 'PUT', body: JSON.stringify(dto) });
            if (response.ok) {
                alert(`Conteúdo atualizado para ${novoStatus}!`);
                renderGerenciadorDeConteudo();
            } else {
                await handleApiError(response, 'diretor-content-dinamico');
            }
        } catch (err) {
            alert('Erro de rede ao atualizar conteúdo.');
        }
    }

    async function handleDeletarConteudo(conteudoId) {
        if (!confirm(`Tem certeza que deseja DELETAR PERMANENTEMENTE este conteúdo? Esta ação não pode ser desfeita.`)) return;
        try {
            const response = await fetchAuthenticated(`/api/conteudo/admin/${conteudoId}`, { method: 'DELETE' });
            if (response.ok) {
                alert(`Conteúdo deletado com sucesso!`);
                renderGerenciadorDeConteudo();
            } else {
                await handleApiError(response, 'diretor-content-dinamico');
            }
        } catch (err) {
            alert('Erro de rede ao deletar conteúdo.');
        }
    }


    // --- Funções de Gerenciar Médicos e Usuários (Já existentes) ---
    function renderFormCadastroMedico() {
        const adminContent = document.getElementById('diretor-content-dinamico');
        adminContent.innerHTML = `
            <h4>Cadastrar Novo Médico</h4>
            <form id="form-cad-medico" class="login-form" style="padding: 0; box-shadow: none;">
                <div id="admin-med-error" class="error-message" style="display: none;"></div>
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
            especialidade: document.getElementById('med-especialidade').value, senha: document.getElementById('med-senha').value
        };
        try {
            const response = await fetchAuthenticated('/api/medicos', { method: 'POST', body: JSON.stringify(dadosMedico) });
            if (response.ok) {
                alert('Médico cadastrado com sucesso!');
                renderFormCadastroMedico();
            } else {
                await handleApiError(response, 'admin-med-error');
            }
        } catch (err) {
            document.getElementById('admin-med-error').textContent = 'Erro de rede.';
            document.getElementById('admin-med-error').style.display = 'block';
        }
    }

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
                    if (confirm(`Desativar: ${e.target.dataset.userName}?`)) {
                        await handleDesativarUsuario(e.target.dataset.userId);
                    }
                });
            });
        } catch (err) {
            console.error(err);
            adminContent.innerHTML = `<p>Erro ao carregar usuários.</p>`;
        }
    }

    function renderUserTable(usuarios) {
        let tableHTML = `
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead><tr><th>ID</th><th>Nome</th><th>Email</th><th>Perfil</th><th>Ativo?</th><th>Ações</th></tr></thead>
                    <tbody>`;
        usuarios.forEach(user => {
            const isSelf = (user.id === idUsuarioLogado);
            tableHTML += `
                <tr>
                    <td>${user.id}</td><td>${user.nome}</td><td>${user.email}</td><td>${user.role}</td>
                    <td>${user.ativo ? 'Sim' : 'Não'}</td>
                    <td><button class="btn-delete btn-delete-user" data-user-id="${user.id}" data-user-name="${user.nome}" ${isSelf ? 'disabled' : ''}>Desativar</button></td>
                </tr>`;
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    async function handleDesativarUsuario(userId) {
        try {
            const response = await fetchAuthenticated(`/api/usuarios/${userId}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Usuário desativado com sucesso!');
                renderGerenciadorDeUsuarios();
            } else {
                await handleApiError(response, 'diretor-content-dinamico');
            }
        } catch (err) {
            alert('Erro ao tentar desativar.');
        }
    }

    // Inicializa o Dashboard
    initDiretorDashboard();
});