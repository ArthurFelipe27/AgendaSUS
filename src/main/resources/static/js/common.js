// ===================================================================
// COMMON.JS (VERSÃO FINAL COM TOASTS)
// ===================================================================

const token = localStorage.getItem('jwtToken');
const userName = localStorage.getItem('userName');

/**
 * Função auxiliar genérica para fazer requisições 'fetch' autenticadas.
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
        return null;
    }
    return response;
}

/**
 * Função de Logout Padrão
 */
function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
}

/**
 * Helper para exibir erros da API, priorizando uma div ou usando um toast.
 */
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
        errorMsg = `Erro ${response.status}: ${response.statusText}`;
    }

    if (errorMessageDiv) {
        errorMessageDiv.textContent = errorMsg;
        errorMessageDiv.style.display = 'block';
    } else {
        showToast(errorMsg, 'error');
    }
}

/**
 * Função Reutilizável para buscar e renderizar o conteúdo público (Notícias)
 */
async function renderNoticiasPublicas(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `<h3>Notícias e Artigos</h3><div id="lista-noticias">Carregando...</div>`;
    try {
        const response = await fetch('/api/conteudo/publico');
        if (!response.ok) throw new Error('Falha ao buscar notícias.');
        const conteudos = await response.json();
        const listaDiv = document.getElementById('lista-noticias');
        listaDiv.innerHTML = '';
        if (conteudos.length === 0) {
            listaDiv.innerHTML = '<p>Nenhuma notícia publicada no momento.</p>';
            return;
        }
        conteudos.forEach(c => {
            const dataPublicacao = c.publicadoEm ? new Date(c.publicadoEm).toLocaleDateString('pt-BR') : 'Data não disponível';
            const item = document.createElement('div');
            item.className = 'document-item';
            item.innerHTML = `
                <h4 class="content-title">${c.titulo}</h4>
                <p class="meta">Publicado por <strong>${c.autor.nome}</strong> em ${dataPublicacao} | Tipo: ${c.tipo}</p>
                <div class="content-body">${c.corpo}</div>
            `;
            listaDiv.appendChild(item);
        });
    } catch (err) {
        console.error("Erro ao buscar conteúdo público:", err);
        container.innerHTML = '<p>Erro ao carregar o conteúdo.</p>';
    }
}

/**
 * Exibe uma notificação "Toast" na tela.
 */
function showToast(message, type = 'info') {
    let backgroundColor;
    switch (type) {
        case 'success':
            backgroundColor = "linear-gradient(to right, #00b09b, #96c93d)";
            break;
        case 'error':
            backgroundColor = "linear-gradient(to right, #ff5f6d, #ffc371)";
            break;
        default:
            backgroundColor = "linear-gradient(to right, #0056b3, #2a9d8f)";
    }
    Toastify({
        text: message, duration: 3000, close: true, gravity: "top", position: "right", stopOnFocus: true,
        style: { background: backgroundColor }
    }).showToast();
}

// Configuração Padrão de Boas-vindas e Logout
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