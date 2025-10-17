// ===================================================================
// COMMON.JS - Arquivo de Funções Comuns
// ===================================================================

const token = localStorage.getItem('jwtToken');
const userName = localStorage.getItem('userName');

/**
 * Realiza uma requisição fetch adicionando automaticamente o header de autorização.
 * Também trata o caso de sessão expirada (401/403), deslogando o usuário.
 * @param {string} url A URL para a qual a requisição será feita.
 * @param {object} options Opções da requisição fetch (method, body, etc.).
 * @returns {Promise<Response|null>} A resposta da requisição ou nulo se a sessão expirou.
 */
async function fetchAuthenticated(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    const finalOptions = { ...options, headers: { ...headers, ...options.headers } };
    const response = await fetch(url, finalOptions);

    if ((response.status === 401 || response.status === 403) && !window.location.pathname.endsWith('login.html')) {
        showToast('Sua sessão expirou ou você não tem permissão.', 'error');
        setTimeout(() => logout(), 2000);
        return null; // Retorna nulo para que a chamada original possa parar a execução
    }
    return response;
}

/**
 * Remove os dados de autenticação do localStorage e redireciona para a página de login.
 */
function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
}

/**
 * Trata erros de API, extraindo a mensagem e exibindo-a em um elemento específico ou via Toast.
 * @param {Response} response O objeto de resposta da requisição fetch.
 * @param {string|null} errorDivId O ID do elemento HTML onde a mensagem de erro deve ser exibida.
 */
async function handleApiError(response, errorDivId) {
    let errorMsg = 'Ocorreu um erro desconhecido.';
    try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
            errorMsg = errorData.message;
        } else if (errorData && Array.isArray(errorData) && errorData[0] && errorData[0].message) { // Para erros de validação
            errorMsg = errorData[0].message;
        }
    } catch (e) {
        errorMsg = `Erro ${response.status}: ${response.statusText || 'Não foi possível conectar ao servidor.'}`;
    }

    const errorMessageDiv = document.getElementById(errorDivId);
    if (errorMessageDiv) {
        errorMessageDiv.textContent = errorMsg;
        errorMessageDiv.style.display = 'block';
    } else {
        showToast(errorMsg, 'error');
    }
}

/**
 * Busca e renderiza as notícias/artigos públicos em um container específico.
 * @param {string} containerId O ID do container onde o conteúdo será renderizado.
 */
async function renderNoticiasPublicas(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `<div class="content-list">Carregando...</div>`;
    const listContainer = container.querySelector('.content-list');

    try {
        // Não precisa de autenticação para este endpoint
        const response = await fetch('/api/conteudo/publico');
        if (!response.ok) throw new Error('Falha ao buscar notícias.');
        const conteudos = await response.json();

        listContainer.innerHTML = '';
        if (conteudos.length === 0) {
            listContainer.innerHTML = '<p>Nenhuma notícia publicada no momento.</p>';
            return;
        }

        conteudos.forEach(c => {
            const dataPublicacao = c.publicadoEm ? new Date(c.publicadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Data não disponível';
            const item = document.createElement('article');
            item.className = 'content-item';
            item.innerHTML = `
                <div class="content-item-header">
                    <h4>${c.titulo}</h4>
                    <p class="content-item-meta">
                        Publicado por <strong>${c.autor.nome}</strong> em ${dataPublicacao}
                    </p>
                </div>
                <div class="content-item-body">
                    ${c.corpo.replace(/\n/g, '<br>')}
                </div>
            `;
            listContainer.appendChild(item);
        });
    } catch (err) {
        console.error("Erro ao buscar conteúdo público:", err);
        listContainer.innerHTML = '<p>Erro ao carregar o conteúdo.</p>';
    }
}

/**
 * Exibe uma notificação flutuante (toast) na tela.
 * @param {string} message A mensagem a ser exibida.
 * @param {'info'|'success'|'error'} type O tipo de notificação, que define sua cor.
 */
function showToast(message, type = 'info') {
    let backgroundColor;
    switch (type) {
        case 'success':
            backgroundColor = "linear-gradient(to right, #16a34a, #65a30d)";
            break;
        case 'error':
            backgroundColor = "linear-gradient(to right, #dc2626, #ea580c)";
            break;
        default:
            backgroundColor = "linear-gradient(to right, #2563eb, #3b82f6)";
    }
    Toastify({
        text: message, duration: 4000, close: true, gravity: "top", position: "right", stopOnFocus: true,
        style: { background: backgroundColor, borderRadius: "8px", fontWeight: "600" }
    }).showToast();
}

// Listener global para configurar elementos comuns em todas as páginas após o carregamento.
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
