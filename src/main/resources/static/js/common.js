// ===================================================================
// COMMON.JS (VERSÃO COM CORREÇÃO NO RENDER DE NOTÍCIAS)
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

    // CORREÇÃO: Substitui o conteúdo do container em vez de adicionar (innerHTML = ...)
    container.innerHTML = `<div class="content-list">Carregando...</div>`;
    const listContainer = container.querySelector('.content-list');

    try {
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

