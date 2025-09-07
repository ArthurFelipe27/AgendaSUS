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