// ===================================================================
// COMMON.JS (VERSÃO FINAL COM TOASTS)
// ===================================================================

const token = localStorage.getItem('jwtToken');
const userName = localStorage.getItem('userName');

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

function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
}

async function handleApiError(response, errorDivId) {
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

    const errorMessageDiv = document.getElementById(errorDivId);
    if (errorMessageDiv) {
        errorMessageDiv.textContent = errorMsg;
        errorMessageDiv.style.display = 'block';
    } else {
        showToast(errorMsg, 'error');
    }
}

async function renderNoticiasPublicas(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `<div class="admin-section-header"><h4>Notícias e Artigos</h4></div><div id="lista-noticias">Carregando...</div>`;
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
            item.innerHTML = `<h4 class="content-title">${c.titulo}</h4><p class="meta">Publicado por <strong>${c.autor.nome}</strong> em ${dataPublicacao}</p><div class="content-body">${c.corpo}</div>`;
            listaDiv.appendChild(item);
        });
    } catch (err) {
        console.error("Erro ao buscar conteúdo público:", err);
        container.innerHTML = '<p>Erro ao carregar o conteúdo.</p>';
    }
}

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
        style: { background: backgroundColor, borderRadius: "6px" }
    }).showToast();
}

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