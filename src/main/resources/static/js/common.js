// --- FUNÇÕES COMUNS PARA TODOS OS DASHBOARDS ---

const token = localStorage.getItem('jwtToken');
const userName = localStorage.getItem('userName');

// Função auxiliar genérica para fazer requisições 'fetch' autenticadas
async function fetchAuthenticated(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    const finalOptions = { ...options, headers: { ...headers, ...options.headers } };
    const response = await fetch(url, finalOptions);

    if ((response.status === 401 || response.status === 403)) {
        alert('Sua sessão expirou ou você não tem permissão. Faça login novamente.');
        logout(); // Chama a função de logout
        return null;
    }
    return response;
}

// Função de Logout Padrão
function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
}

// Configuração comum de Boas-vindas e Logout
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-button');
    const welcomeMessage = document.getElementById('welcome-message');

    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    if (welcomeMessage && userName) {
        welcomeMessage.textContent = `Seja bem-vindo(a), ${userName}!`;
    }
});

// Helper para exibir erros de formulário
async function handleApiError(response, errorDivId) {
    const errorMessageDiv = document.getElementById(errorDivId);
    let errorMsg = 'Ocorreu um erro desconhecido.';
    try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
            errorMsg = errorData.message;
        } else if (errorData && errorData.errors && errorData.errors[0]) {
            errorMsg = errorData.errors[0].defaultMessage;
        }
    } catch (e) {
        // A resposta de erro não foi JSON
        errorMsg = `Erro ${response.status}: ${response.statusText}`;
    }

    errorMessageDiv.textContent = errorMsg;
    errorMessageDiv.style.display = 'block';
}

// EM: static/js/common.js
// ADICIONE ESTA FUNÇÃO NO FINAL DO ARQUIVO:

/**
 * Função Reutilizável para buscar e renderizar o conteúdo público.
 * @param {string} containerId - O ID do elemento <div> onde o conteúdo será renderizado.
 */
async function renderNoticiasPublicas(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return; // Se o container não existir, não faz nada.

    container.innerHTML = `<h3>Notícias e Artigos</h3><div id="lista-noticias">Carregando...</div>`;

    try {
        // Esta chamada de API NÃO precisa de token, então usamos o 'fetch' normal.
        const response = await fetch('/api/conteudo/publico');
        if (!response.ok) throw new Error('Falha ao buscar notícias.');

        const conteudos = await response.json();
        const listaDiv = document.getElementById('lista-noticias');
        listaDiv.innerHTML = ''; // Limpa o "Carregando..."

        if (conteudos.length === 0) {
            listaDiv.innerHTML = '<p>Nenhuma notícia publicada no momento.</p>';
            return;
        }

        conteudos.forEach(c => {
            const dataPublicacao = c.publicadoEm ? new Date(c.publicadoEm).toLocaleDateString('pt-BR') : 'Data não disponível';
            const item = document.createElement('div');
            item.className = 'document-item'; // Reutilizando o estilo que já temos
            item.innerHTML = `
                <h4 class="content-title">${c.titulo}</h4>
                <p class="meta">
                    Publicado por <strong>${c.autor.nome}</strong> em ${dataPublicacao} | Tipo: ${c.tipo}
                </p>
                <div class="content-body">
                    ${c.corpo}
                </div>
            `;
            listaDiv.appendChild(item);
        });

    } catch (err) {
        console.error("Erro ao buscar conteúdo público:", err);
        container.innerHTML = '<p>Erro ao carregar o conteúdo.</p>';
    }
}