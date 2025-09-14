document.addEventListener('DOMContentLoaded', () => {

    const cadastroForm = document.getElementById('cadastro-form');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const cpfInput = document.getElementById('cpf');
    const senhaInput = document.getElementById('senha');
    const confirmaSenhaInput = document.getElementById('confirmaSenha'); // Novo campo

    // Adicionamos um listener para cada campo para validar em tempo real
    nomeInput.addEventListener('blur', () => validaCampo(nomeInput, 'Nome não pode estar em branco.'));
    emailInput.addEventListener('blur', () => validaEmail(emailInput));
    cpfInput.addEventListener('blur', () => validaCpf(cpfInput));
    senhaInput.addEventListener('blur', () => validaSenha(senhaInput));
    confirmaSenhaInput.addEventListener('blur', () => validaConfirmacaoSenha(senhaInput, confirmaSenhaInput));

    const API_URL_CADASTRO = '/api/usuarios';
    const API_URL_LOGIN = '/api/login';

    cadastroForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Roda todas as validações uma última vez antes de enviar
        const isNomeValid = validaCampo(nomeInput, 'Nome não pode estar em branco.');
        const isEmailValid = validaEmail(emailInput);
        const isCpfValid = validaCpf(cpfInput);
        const isSenhaValid = validaSenha(senhaInput);
        const isConfirmaSenhaValid = validaConfirmacaoSenha(senhaInput, confirmaSenhaInput);

        // Se algum campo for inválido, não envia o formulário
        if (!isNomeValid || !isEmailValid || !isCpfValid || !isSenhaValid || !isConfirmaSenhaValid) {
            showToast("Por favor, corrija os erros no formulário.", "error");
            return;
        }

        const cadastroData = {
            nome: nomeInput.value, email: emailInput.value,
            cpf: cpfInput.value.replace(/\D/g, ''), senha: senhaInput.value,
            role: "PACIENTE"
        };

        try {
            const responseCadastro = await fetch(API_URL_CADASTRO, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cadastroData)
            });

            if (!responseCadastro.ok) {
                const errorData = await responseCadastro.json();
                showToast(errorData.message || "Falha no cadastro.", "error");
                return;
            }
            showToast("Cadastro realizado com sucesso! Fazendo login...", "success");

            // ... (resto da lógica de auto-login)
            const responseLogin = await fetch(API_URL_LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cadastroData.email, senha: cadastroData.senha })
            });

            if (!responseLogin.ok) {
                showToast("Login automático falhou.", "error");
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

    // --- NOSSAS NOVAS FUNÇÕES DE VALIDAÇÃO ---
    function validaCampo(input, mensagemErro) {
        if (!input.value.trim()) {
            setErro(input, mensagemErro);
            return false;
        }
        clearErro(input);
        return true;
    }

    function validaEmail(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!input.value.trim() || !emailRegex.test(input.value)) {
            setErro(input, 'Por favor, insira um e-mail válido.');
            return false;
        }
        clearErro(input);
        return true;
    }

    function validaCpf(input) {
        const cpf = input.value.replace(/\D/g, '');
        if (cpf.length !== 11) {
            setErro(input, 'CPF deve ter 11 dígitos (apenas números).');
            return false;
        }
        clearErro(input);
        return true;
    }

    function validaSenha(input) {
        if (input.value.length < 6) {
            setErro(input, 'A senha deve ter no mínimo 6 caracteres.');
            return false;
        }
        clearErro(input);
        return true;
    }

    function validaConfirmacaoSenha(senhaInput, confirmaSenhaInput) {
        if (confirmaSenhaInput.value !== senhaInput.value) {
            setErro(confirmaSenhaInput, 'As senhas não coincidem.');
            return false;
        }
        clearErro(confirmaSenhaInput);
        return true;
    }

    // Funções auxiliares para mostrar/limpar o erro
    function setErro(input, mensagem) {
        const inputGroup = input.parentElement;
        // Remove mensagem de erro antiga, se houver
        const erroAntigo = inputGroup.querySelector('.error-text');
        if (erroAntigo) erroAntigo.remove();

        const errorText = document.createElement('small');
        errorText.className = 'error-text';
        errorText.innerText = mensagem;

        inputGroup.appendChild(errorText);
        input.style.borderColor = '#d93025';
    }

    function clearErro(input) {
        const inputGroup = input.parentElement;
        const erroExistente = inputGroup.querySelector('.error-text');
        if (erroExistente) {
            erroExistente.remove();
        }
        input.style.borderColor = '#ddd';
    }
});