document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('reset-password-form');
    const tokenInput = document.getElementById('token');
    const novaSenhaInput = document.getElementById('novaSenha');
    const confirmaSenhaInput = document.getElementById('confirmaSenha');
    const API_URL = '/api/public/reset-password';

    resetPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const novaSenha = novaSenhaInput.value;
        const confirmaSenha = confirmaSenhaInput.value;

        if (novaSenha.length < 6) {
            showToast('A nova senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        if (novaSenha !== confirmaSenha) {
            showToast('As senhas não coincidem.', 'error');
            return;
        }

        const dto = { token: tokenInput.value, novaSenha: novaSenha };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto)
            });
            const data = await response.json();
            if (response.ok) {
                showToast('Senha redefinida com sucesso! Redirecionando para o login...', 'success');
                setTimeout(() => { window.location.href = 'login.html'; }, 2000);
            } else {
                showToast(data.message || "Erro ao redefinir a senha. Verifique o token.", 'error');
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            showToast('Não foi possível conectar ao servidor.', 'error');
        }
    });
});
