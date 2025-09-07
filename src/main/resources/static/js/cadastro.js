document.addEventListener('DOMContentLoaded', () => {

    const cadastroForm = document.getElementById('cadastro-form');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const cpfInput = document.getElementById('cpf');
    const senhaInput = document.getElementById('senha');
    const errorMessageDiv = document.getElementById('error-message');

    const API_URL_CADASTRO = '/api/usuarios';
    const API_URL_LOGIN = '/api/login';

    cadastroForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        limparErros();

        const nome = nomeInput.value;
        const email = emailInput.value;
        const cpf = cpfInput.value.replace(/\D/g, '');
        const senha = senhaInput.value;

        if (cpf.length !== 11) {
            exibirErro("CPF deve conter 11 dígitos (apenas números).");
            return;
        }

        const cadastroData = {
            nome: nome, email: email, cpf: cpf, senha: senha,
            role: "PACIENTE" // Cadastro público é sempre PACIENTE
        };

        try {
            // 1. Tenta realizar o CADASTRO
            const responseCadastro = await fetch(API_URL_CADASTRO, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cadastroData)
            });

            if (!responseCadastro.ok) {
                // Se o cadastro falhar (ex: email/cpf duplicado), exibe o erro
                const errorData = await responseCadastro.json();
                if (errorData && errorData.message) {
                    exibirErro(errorData.message); // Mensagem do nosso GlobalExceptionHandler (ex: 409 Conflict)
                } else {
                    exibirErro("Falha no cadastro. Verifique os dados.");
                }
                return;
            }

            // 2. SUCESSO! Faz o LOGIN AUTOMÁTICO
            const responseLogin = await fetch(API_URL_LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, senha: senha })
            });

            if (!responseLogin.ok) {
                exibirErro("Cadastro realizado, mas o login automático falhou. Vá para a tela de login.");
                return;
            }

            // 3. LOGIN OK! Salva tudo e redireciona (a lógica do login.js)
            const tokenData = await responseLogin.json();
            localStorage.setItem('jwtToken', tokenData.token);
            localStorage.setItem('userName', tokenData.nome);

            // Redireciona para o dashboard correto (que será o de paciente)
            window.location.href = 'paciente_dashboard.html';

        } catch (error) {
            console.error('Erro de rede no cadastro:', error);
            exibirErro('Não foi possível conectar ao servidor.');
        }
    });

    function exibirErro(mensagem) {
        errorMessageDiv.textContent = mensagem;
        errorMessageDiv.style.display = 'block';
    }
    function limparErros() {
        errorMessageDiv.textContent = '';
        errorMessageDiv.style.display = 'none';
    }
});