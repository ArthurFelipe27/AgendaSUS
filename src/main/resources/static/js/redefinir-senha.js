document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('reset-password-form');
    const tokenInput = document.getElementById('token');
    const novaSenhaInput = document.getElementById('novaSenha');
    const confirmaSenhaInput = document.getElementById('confirmaSenha');
    const API_URL = '/api/public/reset-password';

    // [CORREÇÃO] Seleciona os elementos da lista de critérios de senha.
    const lengthCheck = document.getElementById('length-check');
    const numberCheck = document.getElementById('number-check');

    // [CORREÇÃO] Função que valida a senha em tempo real e atualiza a interface.
    const validatePassword = () => {
        const senha = novaSenhaInput.value;

        // 1. Valida o comprimento (mínimo de 6 caracteres).
        if (senha.length >= 6) {
            lengthCheck.classList.add('valid');
        } else {
            lengthCheck.classList.remove('valid');
        }

        // 2. Valida se a senha contém pelo menos um número.
        if (/\d/.test(senha)) {
            numberCheck.classList.add('valid');
        } else {
            numberCheck.classList.remove('valid');
        }
    };

    // [CORREÇÃO] Adiciona um "event listener" que aciona a validação a cada tecla digitada no campo de senha.
    novaSenhaInput.addEventListener('input', validatePassword);


    resetPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const novaSenha = novaSenhaInput.value;
        const confirmaSenha = confirmaSenhaInput.value;

        // Validações antes do envio do formulário.
        if (novaSenha.length < 6) {
            showToast('A nova senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        if (!/\d/.test(novaSenha)) {
            showToast('A senha deve conter pelo menos um número.', 'error');
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
