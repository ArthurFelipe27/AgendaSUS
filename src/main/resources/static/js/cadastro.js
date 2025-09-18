document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.getElementById('cadastro-form');
    const API_URL_CADASTRO = '/api/usuarios';
    const API_URL_LOGIN = '/api/login';

    cadastroForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
        const senha = document.getElementById('senha').value;
        const confirmaSenha = document.getElementById('confirmaSenha').value;

        if (senha !== confirmaSenha) {
            showToast("As senhas não coincidem.", "error");
            return;
        }

        const cadastroData = {
            nome: nome,
            email: email,
            cpf: cpf,
            senha: senha,
            dataNascimento: document.getElementById('dataNascimento').value,
            telefone: document.getElementById('telefone').value,
            sexo: document.getElementById('sexo').value,
            nomeSocial: document.getElementById('nomeSocial').value,
            cep: document.getElementById('cep').value,
            regiaoAdministrativa: document.getElementById('regiao-administrativa').value,
            numero: document.getElementById('numero').value,
            complemento: document.getElementById('complemento').value
        };

        try {
            const responseCadastro = await fetch(API_URL_CADASTRO, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cadastroData)
            });

            if (!responseCadastro.ok) {
                const errorData = await responseCadastro.json();
                showToast(errorData.message || "Falha no cadastro. Verifique os dados.", "error");
                return;
            }
            showToast("Cadastro realizado! Fazendo login...", "success");

            const responseLogin = await fetch(API_URL_LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, senha: senha })
            });

            if (!responseLogin.ok) {
                showToast("Login automático falhou. Tente fazer login.", "error");
                setTimeout(() => { window.location.href = 'login.html'; }, 2000);
                return;
            }

            const tokenData = await responseLogin.json();
            localStorage.setItem('jwtToken', tokenData.token);
            localStorage.setItem('userName', tokenData.nome);
            window.location.href = 'paciente_dashboard.html';

        } catch (error) {
            console.error('Erro de rede no cadastro:', error);
            showToast('Não foi possível conectar ao servidor.', 'error');
        }
    });
});