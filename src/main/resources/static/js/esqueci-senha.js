document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const tokenDisplayDiv = document.getElementById('token-display');
    const emailInput = document.getElementById('email');
    const resetTokenCode = document.getElementById('reset-token-code');
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
                resetTokenCode.textContent = data.resetToken;
                forgotPasswordForm.style.display = 'none';
                tokenDisplayDiv.style.display = 'block';
            } else {
                showToast(data.message || "Erro ao solicitar token.", "error");
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            showToast('Não foi possível conectar ao servidor.', 'error');
        }
    });
});