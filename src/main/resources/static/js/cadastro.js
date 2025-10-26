document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.getElementById('cadastro-form');
    const API_URL_CADASTRO = '/api/usuarios';
    const API_URL_LOGIN = '/api/login';

    // --- Seleção dos Elementos ---
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const cpfInput = document.getElementById('cpf');
    const senhaInput = document.getElementById('senha');
    const confirmaSenhaInput = document.getElementById('confirmaSenha');
    const dataNascimentoInput = document.getElementById('dataNascimento');
    const telefoneInput = document.getElementById('telefone');
    const sexoInput = document.getElementById('sexo');
    const cepInput = document.getElementById('cep');

    // Seleção dos spans de validação
    const nomeValidation = document.getElementById('nome-validation');
    const emailValidation = document.getElementById('email-validation');
    const cpfValidation = document.getElementById('cpf-validation');
    const senhaValidation = document.getElementById('senha-validation');
    const confirmaSenhaValidation = document.getElementById('confirmaSenha-validation');
    const dataNascimentoValidation = document.getElementById('dataNascimento-validation');
    const telefoneValidation = document.getElementById('telefone-validation');
    const sexoValidation = document.getElementById('sexo-validation');
    const cepValidation = document.getElementById('cep-validation');

    // Critérios da senha
    const lengthCheck = document.getElementById('length-check');
    const numberCheck = document.getElementById('number-check');

    // --- Funções Auxiliares de Validação ---

    function setValidationStatus(inputElement, validationElement, isValid, message = "") {
        if (isValid) {
            inputElement.classList.remove('input-invalid');
            inputElement.classList.add('input-valid');
            if (validationElement) validationElement.textContent = "";
        } else {
            inputElement.classList.remove('input-valid');
            inputElement.classList.add('input-invalid');
            if (validationElement) validationElement.textContent = message;
        }
        // Para selects, a validação é um pouco diferente (não tem fundo colorido)
        if (inputElement.tagName === 'SELECT') {
            if (isValid) {
                inputElement.style.borderColor = 'var(--cor-sucesso)';
            } else {
                inputElement.style.borderColor = 'var(--cor-perigo)';
            }
        }
    }

    function validateNome() {
        const isValid = nomeInput.value.trim().length > 2;
        setValidationStatus(nomeInput, nomeValidation, isValid, isValid ? "" : "Nome deve ter pelo menos 3 caracteres.");
        return isValid;
    }

    function validateEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(emailInput.value);
        setValidationStatus(emailInput, emailValidation, isValid, isValid ? "" : "E-mail inválido.");
        return isValid;
    }

    // Função para validar CPF (formato e dígitos verificadores)
    function validateCPF(cpf) {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf === '' || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        let add = 0;
        for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
        let rev = 11 - (add % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(9))) return false;
        add = 0;
        for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
        rev = 11 - (add % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(10))) return false;
        return true;
    }

    // Função para formatar CPF enquanto digita
    function formatCPF(cpf) {
        cpf = cpf.replace(/\D/g, ""); // Remove tudo que não for dígito
        cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2"); // Coloca ponto após o terceiro dígito
        cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2"); // Coloca ponto após o sexto dígito
        cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Coloca hífen antes dos últimos dois dígitos
        return cpf;
    }

    function handleCPFInput() {
        cpfInput.value = formatCPF(cpfInput.value);
        // A validação só acontece quando o CPF tem o tamanho completo (14 com máscara)
        let isValid = false;
        if (cpfInput.value.length === 14) {
            isValid = validateCPF(cpfInput.value);
        } else if (cpfInput.value.length === 0) {
            isValid = false; // Inválido se vazio (campo obrigatório)
        } else {
            isValid = false; // Inválido se incompleto
        }
        setValidationStatus(cpfInput, cpfValidation, isValid, isValid ? "" : (cpfInput.value.length < 14 ? "CPF incompleto." : "CPF inválido."));
        return isValid;
    }

    function validatePasswordCriteria() {
        const senha = senhaInput.value;
        const hasMinLength = senha.length >= 6;
        const hasNumber = /\d/.test(senha);

        lengthCheck.classList.toggle('valid', hasMinLength);
        numberCheck.classList.toggle('valid', hasNumber);

        const isValid = hasMinLength && hasNumber;
        // A mensagem só aparece se o campo não estiver vazio e for inválido
        const message = !isValid && senha.length > 0 ? "Senha não atende aos critérios." : "";
        setValidationStatus(senhaInput, senhaValidation, isValid, message);
        return isValid;
    }

    function validatePasswordMatch() {
        const senha = senhaInput.value;
        const confirmaSenha = confirmaSenhaInput.value;
        // Só valida se a senha principal for válida e o campo de confirmação não estiver vazio
        const isSenhaPrincipalValid = validatePasswordCriteria(); // Verifica se a senha principal é válida primeiro
        const isValid = isSenhaPrincipalValid && confirmaSenha.length > 0 && senha === confirmaSenha;
        // A mensagem só aparece se a senha principal for válida, mas a confirmação não bate (e não está vazia)
        const message = isSenhaPrincipalValid && confirmaSenha.length > 0 && senha !== confirmaSenha ? "As senhas não coincidem." : "";
        setValidationStatus(confirmaSenhaInput, confirmaSenhaValidation, isValid, message);
        return isValid;
    }

    function validateDataNascimento() {
        const hoje = new Date();
        const dataNasc = new Date(dataNascimentoInput.value + "T00:00:00"); // Adiciona T00:00:00 para evitar problemas de fuso
        hoje.setHours(0, 0, 0, 0); // Zera hora para comparar só a data

        // Verifica se é uma data válida e se não é no futuro
        const isValid = dataNascimentoInput.value && !isNaN(dataNasc) && dataNasc < hoje;
        setValidationStatus(dataNascimentoInput, dataNascimentoValidation, isValid, isValid ? "" : "Data inválida ou futura.");
        return isValid;
    }

    // Função para formatar Telefone enquanto digita
    function formatTelefone(telefone) {
        telefone = telefone.replace(/\D/g, ""); // Remove tudo que não for dígito
        if (telefone.length > 11) telefone = telefone.substring(0, 11); // Limita a 11 dígitos
        if (telefone.length > 10) { // Celular (XX) XXXXX-XXXX
            telefone = telefone.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
        } else if (telefone.length > 6) { // Fixo (XX) XXXX-XXXX
            telefone = telefone.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        } else if (telefone.length > 2) { // (XX) XXXX
            telefone = telefone.replace(/^(\d{2})(\d*)/, "($1) $2");
        } else if (telefone.length > 0) { // (XX
            telefone = telefone.replace(/^(\d*)/, "($1");
        }
        return telefone;
    }

    function handleTelefoneInput() {
        telefoneInput.value = formatTelefone(telefoneInput.value);
        // Validação mais robusta: verifica se tem 10 ou 11 dígitos (sem máscara)
        const digitos = telefoneInput.value.replace(/\D/g, '');
        const isValid = digitos.length === 10 || digitos.length === 11;
        setValidationStatus(telefoneInput, telefoneValidation, isValid, isValid ? "" : "Telefone inválido.");
        return isValid;
    }

    function validateSexo() {
        const isValid = sexoInput.value !== "";
        setValidationStatus(sexoInput, sexoValidation, isValid, isValid ? "" : "Selecione um gênero.");
        return isValid;
    }

    // Função para formatar CEP enquanto digita
    function formatCEP(cep) {
        cep = cep.replace(/\D/g, ""); // Remove tudo que não for dígito
        cep = cep.replace(/^(\d{5})(\d)/, "$1-$2"); // Coloca hífen após o quinto dígito
        if (cep.length > 9) cep = cep.substring(0, 9); // Limita a 9 caracteres (com hífen)
        return cep;
    }

    function handleCEPInput() {
        cepInput.value = formatCEP(cepInput.value);
        // Validação opcional: verifica se tem 8 dígitos (sem máscara) ou está vazio
        const digitos = cepInput.value.replace(/\D/g, '');
        const isValid = cepInput.value.length === 0 || digitos.length === 8;
        setValidationStatus(cepInput, cepValidation, isValid, isValid ? "" : "CEP inválido.");
        return isValid; // Retorna true mesmo se inválido, pois é opcional
    }

    // --- Adição dos Event Listeners ---
    nomeInput.addEventListener('input', validateNome);
    emailInput.addEventListener('input', validateEmail);
    cpfInput.addEventListener('input', handleCPFInput);
    senhaInput.addEventListener('input', () => {
        validatePasswordCriteria();
        validatePasswordMatch(); // Revalida a confirmação quando a senha principal muda
    });
    confirmaSenhaInput.addEventListener('input', validatePasswordMatch);
    dataNascimentoInput.addEventListener('change', validateDataNascimento); // change é melhor para data
    dataNascimentoInput.addEventListener('blur', validateDataNascimento); // Valida ao sair do campo
    telefoneInput.addEventListener('input', handleTelefoneInput);
    sexoInput.addEventListener('change', validateSexo);
    cepInput.addEventListener('input', handleCEPInput);

    // Adiciona validação inicial ao carregar a página (caso haja dados pré-preenchidos)
    validateNome();
    validateEmail();
    handleCPFInput();
    validatePasswordCriteria();
    validatePasswordMatch();
    validateDataNascimento();
    handleTelefoneInput();
    validateSexo();
    handleCEPInput();


    // --- Lógica de Submissão ---
    cadastroForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Executa todas as validações OBRIGATÓRIAS novamente antes de enviar
        const isNomeValid = validateNome();
        const isEmailValid = validateEmail();
        const isCPFValid = handleCPFInput(); // Revalida e formata
        const isSenhaValid = validatePasswordCriteria();
        const isConfirmaSenhaValid = validatePasswordMatch();
        const isDataNascimentoValid = validateDataNascimento();
        const isTelefoneValid = handleTelefoneInput(); // Revalida e formata
        const isSexoValid = validateSexo();
        // Validação do CEP opcional não impede o envio, mas aplica o estilo
        handleCEPInput();
        const isCepFormatValid = cepInput.value.length === 0 || cepInput.value.replace(/\D/g, '').length === 8;


        // Verifica se todos os campos OBRIGATÓRIOS são válidos
        const isFormValid = isNomeValid && isEmailValid && isCPFValid && isSenhaValid && isConfirmaSenhaValid && isDataNascimentoValid && isTelefoneValid && isSexoValid && isCepFormatValid;

        if (!isFormValid) {
            showToast("Por favor, corrija os campos inválidos.", "error");
            // Foca no primeiro campo inválido encontrado
            const firstInvalidInput = cadastroForm.querySelector('.input-invalid');
            if (firstInvalidInput) firstInvalidInput.focus();
            return;
        }

        const cadastroData = {
            nome: nomeInput.value,
            email: emailInput.value,
            cpf: cpfInput.value.replace(/\D/g, ''), // Envia só os números
            senha: senhaInput.value,
            dataNascimento: dataNascimentoInput.value,
            telefone: telefoneInput.value.replace(/\D/g, ''), // Envia só os números
            sexo: sexoInput.value,
            nomeSocial: document.getElementById('nomeSocial').value || null,
            cep: cepInput.value.replace(/\D/g, '') || null, // Envia só os números ou null se vazio
            cidade: document.getElementById('regiao-administrativa').value || null, // Permite nulo se não preenchido
            estado: 'DF', // Fixo para o DF
            numero: document.getElementById('numero').value || null, // Permite nulo
            complemento: document.getElementById('complemento').value || null // Permite nulo
        };

        try {
            // Desabilita o botão de submit para evitar cliques múltiplos
            const submitButton = cadastroForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';


            // 1. Tenta realizar o cadastro
            const responseCadastro = await fetch(API_URL_CADASTRO, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cadastroData)
            });

            if (!responseCadastro.ok) {
                await handleApiError(responseCadastro, null); // Mostra erro da API
                submitButton.disabled = false; // Reabilita o botão em caso de erro
                submitButton.textContent = 'Finalizar Cadastro';
                return;
            }

            showToast("Cadastro realizado! Fazendo login...", "success");

            // 2. Se o cadastro for bem-sucedido, tenta fazer o login automaticamente
            const responseLogin = await fetch(API_URL_LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput.value, senha: senhaInput.value })
            });

            if (!responseLogin.ok) {
                showToast("Login automático falhou. Por favor, tente fazer login manualmente.", "error");
                setTimeout(() => { window.location.href = 'login.html'; }, 2000);
                // Não precisa reabilitar o botão aqui, pois vai redirecionar
                return;
            }

            // 3. Se o login for bem-sucedido, salva o token e redireciona
            const tokenData = await responseLogin.json();
            localStorage.setItem('jwtToken', tokenData.token);
            localStorage.setItem('userName', tokenData.nome);
            window.location.href = 'paciente_dashboard.html'; // Assume que cadastro é sempre paciente

        } catch (error) {
            console.error('Erro de rede no fluxo de cadastro:', error);
            showToast('Não foi possível conectar ao servidor.', 'error');
            // Reabilita o botão em caso de erro de rede
            const submitButton = cadastroForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Finalizar Cadastro';
            }
        }
    });
});

