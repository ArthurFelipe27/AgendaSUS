document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const tokenDisplayDiv = document.getElementById('token-display');
    const emailInput = document.getElementById('email');
    const errorMessageDiv = document.getElementById('error-message');
    const resetTokenCode = document.getElementById('reset-token-code');

    const API_URL = '/api/public/forgot-password';

    forgotPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessageDiv.style.display = 'none';

        const email = emailInput.value;
        const dto = { email: email };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto)
            });

            const data = await response.json();

            if (response.ok) {
                // Sucesso! Mostra o token.
                resetTokenCode.textContent = data.resetToken;
                forgotPasswordForm.style.display = 'none'; // Esconde o formulário de email
                tokenDisplayDiv.style.display = 'block';   // Mostra a div com o token
            } else {
                // Erro (ex: email não encontrado)
                errorMessageDiv.textContent = data.message || "Erro ao solicitar token.";
                errorMessageDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            errorMessageDiv.textContent = 'Não foi possível conectar ao servidor.';
            errorMessageDiv.style.display = 'block';
        }
    });
});