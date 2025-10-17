document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const tokenDisplayDiv = document.getElementById('token-display');
    const emailInput = document.getElementById('email');
    const resetTokenCode = document.getElementById('reset-token-code');
    const copyButton = document.getElementById('btn-copy-token');

    const API_URL = '/api/public/forgot-password';

    forgotPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const dto = { email: emailInput.value };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto)
            });
            const data = await response.json();

            if (response.ok) {
                // Sucesso! Mostra a seção do token e esconde o formulário.
                resetTokenCode.textContent = data.resetToken;
                forgotPasswordForm.style.display = 'none';
                tokenDisplayDiv.style.display = 'block';

                // Adiciona a funcionalidade de cópia ao botão
                copyButton.addEventListener('click', () => {
                    // Usa a API Clipboard para maior compatibilidade e segurança
                    navigator.clipboard.writeText(data.resetToken).then(() => {
                        showToast('Token copiado para a área de transferência!', 'success');
                        copyButton.textContent = 'Copiado!';
                        setTimeout(() => { copyButton.textContent = 'Copiar'; }, 2000);
                    }).catch(err => {
                        console.error('Erro ao copiar token: ', err);
                        showToast('Falha ao copiar. Por favor, copie manualmente.', 'error');
                    });
                });

            } else {
                showToast(data.message || "Erro ao solicitar token.", "error");
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            showToast('Não foi possível conectar ao servidor.', 'error');
        }
    });
});
