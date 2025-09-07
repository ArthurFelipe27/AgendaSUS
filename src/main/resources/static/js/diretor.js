document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    const usuarioLogadoNome = localStorage.getItem('userName');

    // Pega o ID do usuário do token (precisamos buscar o /me)
    let idUsuarioLogado = null;

    async function initDiretorDashboard() {
        try {
            // Precisamos do ID do diretor logado para não deixar ele se auto-desativar
            const responseMe = await fetchAuthenticated('/api/usuarios/me');
            if (!responseMe.ok) throw new Error('Falha ao buscar perfil do admin');
            const adminUser = await responseMe.json();
            idUsuarioLogado = adminUser.id;

            // Renderiza o painel principal
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
                <div class="dashboard-card admin" id="card-gerenciar-medicos">Cadastrar/Gerenciar Médicos</div>
                <div class="dashboard-card admin" id="card-gerenciar-usuarios">Gerenciar Usuários</div>
                <div class="dashboard-card admin" id="card-gerenciar-conteudo">Gerenciar Conteúdo</div>
            </div>
            <hr>
            <div id="diretor-content-dinamico"></div> 
        `;

        // Listeners dos Cards
        document.getElementById('card-gerenciar-medicos').addEventListener('click', renderGerenciadorDeMedicos);
        document.getElementById('card-gerenciar-usuarios').addEventListener('click', renderGerenciadorDeUsuarios);
        // document.getElementById('card-gerenciar-conteudo').addEventListener('click', renderGerenciadorDeConteudo);
    }

    // --- Funções: Gerenciar Médicos ---
    function renderGerenciadorDeMedicos() {
        // Por agora, apenas o formulário de cadastro.
        // Uma versão completa listaria os médicos com botões de editar/desativar.
        const adminContent = document.getElementById('diretor-content-dinamico');
        adminContent.innerHTML = `
            <h4>Cadastrar Novo Médico</h4>
            <form id="form-cad-medico" class="login-form" style="padding: 0; box-shadow: none;">
                <div id="admin-med-error" class="error-message" style="display: none;"></div>
                <div class="input-group"><label for="med-nome">Nome</label><input type="text" id="med-nome" required></div>
                <div class="input-group"><label for="med-email">Email</label><input type="email" id="med-email" required></div>
                <div class="input-group"><label for="med-cpf">CPF</label><input type="text" id="med-cpf" required maxlength="11"></div>
                <div class="input-group"><label for="med-crm">CRM</label><input type="text" id="med-crm" required></div>
                <div class="input-group"><label for="med-especialidade">Especialidade</label><input type="text" id="med-especialidade" required></div>
                <div class="input-group"><label for="med-senha">Senha</label><input type="password" id="med-senha" required minlength="6"></div>
                <button type="submit" class="btn-login">Cadastrar Médico</button>
            </form>
        `;
        document.getElementById('form-cad-medico').addEventListener('submit', handleCadastroMedicoSubmit);
    }

    async function handleCadastroMedicoSubmit(event) {
        event.preventDefault();
        const dadosMedico = {
            nome: document.getElementById('med-nome').value,
            email: document.getElementById('med-email').value,
            cpf: document.getElementById('med-cpf').value,
            crm: document.getElementById('med-crm').value,
            especialidade: document.getElementById('med-especialidade').value,
            senha: document.getElementById('med-senha').value
        };

        try {
            const response = await fetchAuthenticated('/api/medicos', { method: 'POST', body: JSON.stringify(dadosMedico) });
            if (response.ok) {
                alert('Médico cadastrado com sucesso!');
                renderFormCadastroMedico(); // Limpa o formulário
            } else {
                await handleApiError(response, 'admin-med-error');
            }
        } catch (err) {
            document.getElementById('admin-med-error').textContent = 'Erro de rede.';
            document.getElementById('admin-med-error').style.display = 'block';
        }
    }

    // --- Funções: Gerenciar Usuários ---
    async function renderGerenciadorDeUsuarios() {
        const adminContent = document.getElementById('diretor-content-dinamico');
        adminContent.innerHTML = `<h4>Gerenciamento de Usuários</h4><div id="admin-user-list-container">Carregando...</div>`;

        try {
            const response = await fetchAuthenticated('/api/usuarios');
            if (!response || !response.ok) throw new Error('Falha ao buscar usuários');

            const usuarios = await response.json();
            document.getElementById('admin-user-list-container').innerHTML = renderUserTable(usuarios);

            document.querySelectorAll('.btn-delete-user').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const userId = e.target.dataset.userId;
                    const userName = e.target.dataset.userName;

                    if (confirm(`Tem certeza que deseja desativar o usuário: ${userName} (ID: ${userId})?`)) {
                        await handleDesativarUsuario(userId);
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
                    <thead><tr>
                        <th>ID</th><th>Nome</th><th>Email</th><th>CPF</th><th>Perfil</th><th>Ativo?</th><th>Ações</th>
                    </tr></thead>
                    <tbody>
        `;
        usuarios.forEach(user => {
            const isSelf = (user.id === idUsuarioLogado); // Usa o ID global que buscamos
            tableHTML += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.nome}</td>
                    <td>${user.email}</td>
                    <td>${user.cpf}</td>
                    <td>${user.role}</td>
                    <td>${user.ativo ? 'Sim' : 'Não'}</td>
                    <td>
                        <button class="btn-delete btn-delete-user" data-user-id="${user.id}" data-user-name="${user.nome}" ${isSelf ? 'disabled' : ''}>
                            Desativar
                        </button>
                    </td>
                </tr>
            `;
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    async function handleDesativarUsuario(userId) {
        try {
            const response = await fetchAuthenticated(`/api/usuarios/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) { // 204 No Content
                alert('Usuário desativado com sucesso!');
                renderGerenciadorDeUsuarios(); // Recarrega a lista
            } else {
                const error = await response.json();
                alert(`Falha ao desativar: ${error.message}`);
            }
        } catch (err) {
            console.error(err);
            alert('Ocorreu um erro ao tentar desativar.');
        }
    }

    // --- (Aqui entrariam as funções do Gerenciador de Conteúdo) ---

    // Inicializa o Dashboard do Diretor
    initDiretorDashboard();
});