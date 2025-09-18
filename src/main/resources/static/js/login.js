document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const API_URL_LOGIN = '/api/login';

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const loginData = { email: emailInput.value, senha: senhaInput.value };

        try {
            const response = await fetch(API_URL_LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('jwtToken', data.token);
                localStorage.setItem('userName', data.nome);
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
                showToast('Usuário ou senha inválidos.', 'error');
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            showToast('Não foi possível conectar ao servidor.', 'error');
        }
    });
});