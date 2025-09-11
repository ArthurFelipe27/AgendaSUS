document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('reset-password-form');
    const tokenInput = document.getElementById('token');
    const novaSenhaInput = document.getElementById('novaSenha');
    const confirmaSenhaInput = document.getElementById('confirmaSenha');
    const errorMessageDiv = document.getElementById('error-message');

    const API_URL = '/api/public/reset-password';

    resetPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessageDiv.style.display = 'none';

        const token = tokenInput.value;
        const novaSenha = novaSenhaInput.value;
        const confirmaSenha = confirmaSenhaInput.value;

        // Validação no frontend
        if (novaSenha !== confirmaSenha) {
            errorMessageDiv.textContent = 'As senhas não coincidem.';
            errorMessageDiv.style.display = 'block';
            return;
        }

        const dto = { token: token, novaSenha: novaSenha };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Senha redefinida com sucesso! Você será redirecionado para o login.');
                window.location.href = 'login.html';
            } else {
                // Erro (ex: token inválido/expirado)
                errorMessageDiv.textContent = data.message || "Erro ao redefinir a senha.";
                errorMessageDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            errorMessageDiv.textContent = 'Não foi possível conectar ao servidor.';
            errorMessageDiv.style.display = 'block';
        }
    });
});