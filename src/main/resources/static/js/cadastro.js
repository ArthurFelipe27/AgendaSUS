document.addEventListener('DOMContentLoaded', () => {
    // Seleciona o formulário
    const cadastroForm = document.getElementById('cadastro-form');

    // --- URLs da API ---
    const API_URL_CADASTRO = '/api/usuarios';
    const API_URL_LOGIN = '/api/login';

    // Adiciona o "ouvinte" de envio ao formulário
    cadastroForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // --- Coleta dos dados de todos os campos ---
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
        const senha = document.getElementById('senha').value;
        const dataNascimento = document.getElementById('dataNascimento').value;
        const telefone = document.getElementById('telefone').value;
        const sexo = document.getElementById('sexo').value;
        const nomeSocial = document.getElementById('nomeSocial').value;
        const cep = document.getElementById('cep').value;
        const cidade = document.getElementById('cidade').value;
        const estado = document.getElementById('estado').value;
        const numero = document.getElementById('numero').value;
        const complemento = document.getElementById('complemento').value;

        // Monta o DTO que o backend espera, com todos os novos campos
        const cadastroData = {
            nome, email, cpf, senha, dataNascimento, telefone, sexo,
            nomeSocial, cep, cidade, estado, numero, complemento
            // A role será definida como PACIENTE no backend
        };

        try {
            // 1. Tenta realizar o CADASTRO
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
            showToast("Cadastro realizado com sucesso! Fazendo login...", "success");

            // 2. SUCESSO! Faz o LOGIN AUTOMÁTICO
            const responseLogin = await fetch(API_URL_LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, senha: senha })
            });

            if (!responseLogin.ok) {
                showToast("Login automático falhou. Tente fazer login manualmente.", "error");
                setTimeout(() => { window.location.href = 'login.html'; }, 2000);
                return;
            }

            // 3. LOGIN OK! Salva tudo e redireciona
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