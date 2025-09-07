document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const errorMessageDiv = document.getElementById('error-message');

    // Usa caminho relativo da API
    const API_URL_LOGIN = '/api/login';

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessageDiv.style.display = 'none';

        const loginData = {
            email: emailInput.value,
            senha: senhaInput.value
        };

        try {
            const response = await fetch(API_URL_LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            if (response.ok) {
                const data = await response.json();

                localStorage.setItem('jwtToken', data.token);
                // Salva o nome para usar nos dashboards
                localStorage.setItem('userName', data.nome);

                // ROTEADOR: Redireciona baseado na ROLE
                switch (data.role) {
                    case 'PACIENTE':
                        window.location.href = 'paciente_dashboard.html';
                        break;
                    case 'MEDICO':
                        window.location.href = 'medico_dashboard.html';
                        break;
                    case 'DIRETOR':
                        window.location.href = 'diretor_dashboard.html';
                        break;
                    default:
                        localStorage.clear();
                        window.location.href = 'login.html';
                }

            } else {
                // Erro 403 (Forbidden) do Spring Security para login inválido
                exibirErro('Usuário ou senha inválidos.');
            }

        } catch (error) {
            console.error('Erro de rede:', error);
            exibirErro('Não foi possível conectar ao servidor.');
        }
    });

    function exibirErro(mensagem) {
        errorMessageDiv.textContent = mensagem;
        errorMessageDiv.style.display = 'block';
    }
});