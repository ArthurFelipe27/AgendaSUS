document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('reset-password-form');
    const tokenInput = document.getElementById('token');
    const novaSenhaInput = document.getElementById('novaSenha');
    const confirmaSenhaInput = document.getElementById('confirmaSenha');
    const API_URL = '/api/public/reset-password';

    // Seletores para os critérios de validação da senha
    const lengthCheck = document.getElementById('length-check');
    const numberCheck = document.getElementById('number-check');

    // Função para validar a senha em tempo real
    const validatePassword = () => {
        const password = novaSenhaInput.value;

        // 1. Verifica o comprimento
        if (password.length >= 6) {
            lengthCheck.classList.add('valid');
        } else {
            lengthCheck.classList.remove('valid');
        }

        // 2. Verifica se contém número
        if (/\d/.test(password)) {
            numberCheck.classList.add('valid');
        } else {
            numberCheck.classList.remove('valid');
        }
    };

    // Adiciona o listener para o evento de digitação no campo da nova senha
    novaSenhaInput.addEventListener('input', validatePassword);

    resetPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const novaSenha = novaSenhaInput.value;
        const confirmaSenha = confirmaSenhaInput.value;

        // Validação final antes do envio
        if (novaSenha.length < 6 || !/\d/.test(novaSenha)) {
            showToast('Sua nova senha não atende aos critérios de segurança.', 'error');
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
                showToast('Senha redefinida com sucesso! Redirecionando...', 'success');
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
