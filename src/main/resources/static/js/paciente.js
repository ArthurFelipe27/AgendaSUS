// ===================================================================
// PACIENTE.JS (VERSÃO COMPLETA E ATUALIZADA)
// Inclui filtros, Central de Ajuda, e Edição de Perfil do Paciente.
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    let idUsuarioLogado = null;
    let dadosUsuarioAtual = null; // Armazena os dados completos do usuário/paciente
    let todosOsMedicos = []; // Armazena a lista completa de médicos

    const DIAS_SEMANA_MAP = { "DOMINGO": 0, "SEGUNDA": 1, "TERCA": 2, "QUARTA": 3, "QUINTA": 4, "SEXTA": 5, "SABADO": 6 };
    const SPINNER_HTML = `<div class="spinner-container"><div class="spinner"></div></div>`;
    // Lista de RAs para o dropdown
    const REGIOES_ADMINISTRATIVAS_DF = ["Plano Piloto", "Gama", "Taguatinga", "Brazlândia", "Sobradinho", "Planaltina", "Paranoá", "Núcleo Bandeirante", "Ceilândia", "Guará", "Cruzeiro", "Samambaia", "Santa Maria", "São Sebastião", "Recanto das Emas", "Lago Sul", "Riacho Fundo", "Lago Norte", "Candangolândia", "Águas Claras", "Riacho Fundo II", "Sudoeste/Octogonal", "Varjão", "Park Way", "SCIA (Estrutural)", "Sobradinho II", "Jardim Botânico", "Itapoã", "SIA", "Vicente Pires", "Fercal", "Sol Nascente/Pôr do Sol", "Arniqueira"];


    function getProximaDataISO(diaDaSemana, horaMinuto) {
        const [hora, minuto] = horaMinuto.split(':').map(Number);
        const agora = new Date();
        const diaDeHoje = agora.getDay();
        const diaAlvoJS = DIAS_SEMANA_MAP[diaDaSemana.toUpperCase()];
        let diasParaAdicionar = diaAlvoJS - diaDeHoje;
        if (diasParaAdicionar < 0 || (diasParaAdicionar === 0 && (agora.getHours() > hora || (agora.getHours() === hora && agora.getMinutes() >= minuto)))) {
            diasParaAdicionar += 7;
        }
        const dataAlvo = new Date(agora);
        dataAlvo.setDate(agora.getDate() + diasParaAdicionar);
        dataAlvo.setHours(hora, minuto, 0, 0);
        const pad = (num) => num.toString().padStart(2, '0');
        const ano = dataAlvo.getFullYear();
        const mes = pad(dataAlvo.getMonth() + 1);
        const dia = pad(dataAlvo.getDate());
        const horaFormatada = pad(dataAlvo.getHours());
        const minutoFormatado = pad(dataAlvo.getMinutes());
        return `${ano}-${mes}-${dia}T${horaFormatada}:${minutoFormatado}:00`;
    }

    async function initPacienteDashboard() {
        try {
            // Busca os dados completos do perfil, incluindo endereço
            const responseMe = await fetchAuthenticated('/api/usuarios/me');
            if (!responseMe || !responseMe.ok) throw new Error('Falha ao buscar perfil do paciente');
            dadosUsuarioAtual = await responseMe.json(); // Armazena os dados
            idUsuarioLogado = dadosUsuarioAtual.id; // Pega o ID
        } catch (e) {
            console.error(e);
            contentArea.innerHTML = "<p>Erro fatal ao carregar dados do paciente. Faça o login novamente.</p>";
            // Considerar deslogar o usuário aqui se a busca falhar
            // setTimeout(logout, 3000);
            return;
        }

        contentArea.innerHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card" id="card-agendar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                    <span>Novo Agendamento</span>
                </div>
                <div class="dashboard-card" id="card-meus-agendamentos">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>Meus Agendamentos</span>
                </div>
                <div class="dashboard-card" id="card-meu-perfil">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span>Meu Perfil</span>
                </div>
                <div class="dashboard-card" id="card-noticias">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                    <span>Notícias e Artigos</span>
                </div>
                 <div class="dashboard-card" id="card-ajuda">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    <span>Central de Ajuda</span>
                </div>
            </div>
            <hr>
            <div id="paciente-content-dinamico"></div>
        `;

        document.getElementById('card-agendar').addEventListener('click', renderTelaDeAgendamento);
        document.getElementById('card-meus-agendamentos').addEventListener('click', renderMeusAgendamentos);
        document.getElementById('card-meu-perfil').addEventListener('click', renderMeuPerfil); // Chama a função atualizada
        document.getElementById('card-noticias').addEventListener('click', () => {
            document.getElementById('paciente-content-dinamico').innerHTML = `<div class="admin-section-header"><h3>Notícias e Artigos</h3></div>`;
            renderNoticiasPublicas('paciente-content-dinamico');
        });
        document.getElementById('card-ajuda').addEventListener('click', renderCentralDeAjuda);

        renderTelaDeAgendamento(); // Inicia na tela de agendamento
    }

    // Função para renderizar a Central de Ajuda
    function renderCentralDeAjuda() {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        contentDinamico.innerHTML = `
            <div class="admin-section-header">
                <h3>Central de Ajuda</h3>
            </div>
            <p>Encontre respostas para as perguntas mais comuns sobre o uso do AgendaSUS.</p>
            <div class="faq-container">
                <details>
                    <summary>Como agendo uma nova consulta?</summary>
                    <div class="faq-content">
                        <p><strong>1. Acesse a tela "Novo Agendamento":</strong> Este é o primeiro item que aparece no seu dashboard.</p>
                        <p><strong>2. Filtre e Encontre um Médico:</strong> Você pode buscar médicos pelo nome, especialidade ou pela Unidade de Saúde.</p>
                        <p><strong>3. Veja os Horários:</strong> Clique em "Ver horários &rarr;" no médico desejado.</p>
                        <p><strong>4. Escolha um Horário:</strong> Os horários disponíveis estarão em azul. Clique no que for melhor para você.</p>
                        <p><strong>5. Descreva seus Sintomas:</strong> Preencha o formulário final com seus sintomas e outras informações relevantes e clique em "Confirmar Agendamento".</p>
                    </div>
                </details>
                <details>
                    <summary>Como posso ver meus agendamentos?</summary>
                    <div class="faq-content">
                        <p>Clique no card <strong>"Meus Agendamentos"</strong>. A tela mostrará duas seções:</p>
                        <p><strong>- Próximos Agendamentos:</strong> Suas consultas futuras, com status PENDENTE ou CONFIRMADO.</p>
                        <p><strong>- Histórico de Agendamentos:</strong> Todas as suas consultas passadas (ATENDIDO, CANCELADO, etc.).</p>
                    </div>
                </details>
                 <details>
                    <summary>Como cancelo uma consulta?</summary>
                    <div class="faq-content">
                        <p><strong>1.</strong> Vá para <strong>"Meus Agendamentos"</strong>.</p>
                        <p><strong>2.</strong> Na lista de "Próximos Agendamentos", encontre a consulta que deseja cancelar.</p>
                        <p><strong>3.</strong> Clique no botão vermelho <strong>"Cancelar"</strong> ao lado dela e confirme a ação.</p>
                        <p>Lembre-se: Só é possível cancelar agendamentos com status PENDENTE ou CONFIRMADO.</p>
                    </div>
                </details>
                <details>
                    <summary>Onde encontro minhas prescrições, atestados e exames?</summary>
                    <div class="faq-content">
                        <p><strong>1.</strong> Acesse <strong>"Meus Agendamentos"</strong> e vá para o <strong>"Histórico de Agendamentos"</strong>.</p>
                        <p><strong>2.</strong> Encontre a consulta que foi "ATENDIDA".</p>
                        <p><strong>3.</strong> Clique no botão <strong>"Ver Detalhes"</strong>. Uma nova seção aparecerá na tela com todos os documentos gerados naquela consulta (prescrições, atestados e a lista de exames solicitados).</p>
                    </div>
                </details>
                 <details>
                    <summary>Como atualizo meu endereço ou telefone?</summary>
                    <div class="faq-content">
                        <p><strong>1.</strong> Clique no card <strong>"Meu Perfil"</strong> no seu dashboard.</p>
                        <p><strong>2.</strong> Clique no botão <strong>"Editar Endereço/Telefone"</strong>.</p>
                        <p><strong>3.</strong> Altere os campos desejados no formulário que aparecerá.</p>
                        <p><strong>4.</strong> Clique em <strong>"Salvar Alterações"</strong>.</p>
                    </div>
                </details>
                 <details>
                    <summary>Esqueci minha senha, e agora?</summary>
                    <div class="faq-content">
                        <p><strong>1.</strong> Na tela de login, clique no link <strong>"Esqueci minha senha"</strong>.</p>
                        <p><strong>2.</strong> Informe seu e-mail de cadastro para receber um token de recuperação.</p>
                        <p><strong>3.</strong> Vá para a página de redefinição, cole o token e crie uma nova senha.</p>
                    </div>
                </details>
            </div>
        `;
    }

    // Função Meu Perfil para exibir mais dados e formulário de edição
    async function renderMeuPerfil() {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        // Usa dadosUsuarioAtual que já buscamos no início
        const usuario = dadosUsuarioAtual;

        if (!usuario) {
            contentDinamico.innerHTML = '<p>Erro ao carregar dados do perfil. Tente recarregar a página.</p>';
            return;
        }

        // Formata o endereço para exibição
        const enderecoCompleto = [
            usuario.cep ? `CEP: ${formatCEP(usuario.cep)}` : '', // Formata o CEP para exibição
            usuario.cidade ? `RA: ${usuario.cidade}` : '',
            usuario.numero ? `Nº: ${usuario.numero}` : '',
            usuario.complemento ? `Comp: ${usuario.complemento}` : ''
        ].filter(Boolean).join(' | '); // Junta com ' | ' apenas os que existem

        // Gera as opções para o select de Região Administrativa
        let optionsHtml = '<option value="">Selecione...</option>';
        REGIOES_ADMINISTRATIVAS_DF.sort().forEach(ra => {
            optionsHtml += `<option value="${ra}" ${usuario.cidade === ra ? 'selected' : ''}>${ra}</option>`;
        });

        contentDinamico.innerHTML = `
        <div class="section-card">
            <div class="admin-section-header">
                <h3>Meu Perfil</h3>
            </div>
            <div id="perfil-info" class="document-item">
                <p><strong>Nome:</strong> ${usuario.nome || 'N/A'}</p>
                <p><strong>Nome Social:</strong> ${usuario.nomeSocial || 'N/A'}</p>
                <p><strong>Email:</strong> ${usuario.email || 'N/A'}</p>
                <p><strong>CPF:</strong> ${formatCPF(usuario.cpf) || 'N/A'}</p>  Formata CPF -->
                <p><strong>Data de Nascimento:</strong> ${usuario.dataNascimento ? new Date(usuario.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}</p>
                <p><strong>Gênero:</strong> ${usuario.sexo || 'N/A'}</p>
                <p><strong>Telefone:</strong> ${formatTelefone(usuario.telefone) || 'Não informado'}</p>  Formata Telefone -->
                <p><strong>Endereço:</strong> ${enderecoCompleto || 'Não informado'}</p>
            </div>
            <div class="form-actions" style="margin-top: 1.5rem;">
                <button class="btn btn-primary" id="btn-editar-perfil">Editar Endereço/Telefone</button>
            </div>

             Formulário de Edição (inicialmente oculto) -->
            <div id="perfil-edit-form-container" class="booking-form-container" style="display: none; margin-top: 2rem; border-top: 1px solid var(--cor-borda); padding-top: 2rem;">
                <h4>Editar Endereço e Telefone</h4>
                <form id="form-editar-paciente">
                    <div id="paciente-edit-error" class="error-message" style="display:none;"></div>
                    <div class="input-group">
                        <label for="edit-telefone">Telefone / Celular</label>
                        <input type="tel" id="edit-telefone" value="${formatTelefone(usuario.telefone) || ''}" placeholder="(XX) XXXXX-XXXX">
                    </div>
                     <div class="input-group">
                        <label for="edit-cep">CEP</label>
                        <input type="text" id="edit-cep" value="${formatCEP(usuario.cep) || ''}" maxlength="9" placeholder="XXXXX-XXX">
                    </div>
                     <div class="input-group">
                        <label for="edit-cidade">Região Administrativa (DF)</label>
                        <select id="edit-cidade">${optionsHtml}</select>
                     </div>
                     <div class="input-group">
                        <label for="edit-numero">Número</label>
                        <input type="text" id="edit-numero" value="${usuario.numero || ''}">
                     </div>
                     <div class="input-group">
                        <label for="edit-complemento">Complemento</label>
                        <input type="text" id="edit-complemento" value="${usuario.complemento || ''}">
                     </div>
                     <input type="hidden" id="edit-estado" value="DF">  Estado fixo -->
                     <div class="form-actions">
                         <button type="submit" class="btn btn-success">Salvar Alterações</button>
                         <button type="button" class="btn btn-secondary" id="btn-cancelar-edicao">Cancelar</button>
                     </div>
                </form>
            </div>
        </div>

         Seção de Alterar Senha -->
        <div class="section-card" style="margin-top: 1.5rem;">
            <h4>Alterar Senha</h4>
            <form id="form-alterar-senha">
                <div id="senha-error-message" class="error-message" style="display:none;"></div>
                <div class="input-group">
                    <label for="nova-senha">Nova Senha</label>
                    <input type="password" id="nova-senha" required minlength="6">
                </div>
                  Critérios da Senha -->
                <div class="password-criteria-container" style="margin-top: -0.5rem; margin-bottom: 1rem;">
                    <ul>
                        <li id="length-check-perfil">Pelo menos 6 caracteres</li>
                        <li id="number-check-perfil">Conter pelo menos um número</li>
                    </ul>
                </div>
                <div class="input-group">
                    <label for="confirma-senha">Confirme a Nova Senha</label>
                    <input type="password" id="confirma-senha" required>
                </div>
                <div class="form-actions" style="justify-content: flex-end;">
                    <button type="submit" class="btn btn-success">Salvar Nova Senha</button>
                </div>
            </form>
        </div>
        `;

        // Adiciona listeners para os botões de edição
        document.getElementById('btn-editar-perfil').addEventListener('click', () => {
            document.getElementById('perfil-edit-form-container').style.display = 'block';
            document.getElementById('btn-editar-perfil').style.display = 'none'; // Esconde o botão editar
            document.getElementById('edit-telefone').focus(); // Foca no primeiro campo do form
        });
        document.getElementById('btn-cancelar-edicao').addEventListener('click', () => {
            document.getElementById('perfil-edit-form-container').style.display = 'none';
            document.getElementById('btn-editar-perfil').style.display = 'inline-block'; // Mostra o botão editar novamente
            // Opcional: Resetar os valores do form para os originais se o usuário digitou algo
            document.getElementById('edit-telefone').value = formatTelefone(dadosUsuarioAtual.telefone) || '';
            document.getElementById('edit-cep').value = formatCEP(dadosUsuarioAtual.cep) || '';
            document.getElementById('edit-cidade').value = dadosUsuarioAtual.cidade || '';
            document.getElementById('edit-numero').value = dadosUsuarioAtual.numero || '';
            document.getElementById('edit-complemento').value = dadosUsuarioAtual.complemento || '';
            document.getElementById('paciente-edit-error').style.display = 'none'; // Esconde msg de erro
        });

        // Listener para o formulário de edição de paciente
        document.getElementById('form-editar-paciente').addEventListener('submit', handleUpdatePacienteData);

        // Listener para o formulário de alterar senha
        document.getElementById('form-alterar-senha').addEventListener('submit', handleUpdatePassword);

        // Adiciona validação em tempo real para nova senha no perfil
        const novaSenhaInputPerfil = document.getElementById('nova-senha');
        const confirmaSenhaInputPerfil = document.getElementById('confirma-senha');
        const lengthCheckPerfil = document.getElementById('length-check-perfil');
        const numberCheckPerfil = document.getElementById('number-check-perfil');

        const validatePasswordPerfil = () => {
            const senha = novaSenhaInputPerfil.value;
            lengthCheckPerfil.classList.toggle('valid', senha.length >= 6);
            numberCheckPerfil.classList.toggle('valid', /\d/.test(senha));
        };
        novaSenhaInputPerfil.addEventListener('input', validatePasswordPerfil);

        // Adiciona máscaras aos campos de telefone e CEP no formulário de edição
        const telInputEdit = document.getElementById('edit-telefone');
        const cepInputEdit = document.getElementById('edit-cep');
        telInputEdit.addEventListener('input', (e) => { e.target.value = formatTelefone(e.target.value); });
        cepInputEdit.addEventListener('input', (e) => { e.target.value = formatCEP(e.target.value); });
    }

    // Função para lidar com a atualização dos dados do paciente (endereço/telefone)
    async function handleUpdatePacienteData(event) {
        event.preventDefault();
        const telefoneInput = document.getElementById('edit-telefone');
        const cepInput = document.getElementById('edit-cep');
        const cidadeInput = document.getElementById('edit-cidade');
        const numeroInput = document.getElementById('edit-numero');
        const complementoInput = document.getElementById('edit-complemento');

        // Remove máscaras antes de enviar
        const telefoneLimpo = telefoneInput.value.replace(/\D/g, '');
        const cepLimpo = cepInput.value.replace(/\D/g, '');

        // Validação simples
        if (telefoneLimpo && (telefoneLimpo.length < 10 || telefoneLimpo.length > 11)) {
            showToast('Número de telefone inválido.', 'error');
            telefoneInput.focus();
            return;
        }
        if (cepLimpo && cepLimpo.length !== 8) {
            showToast('CEP inválido. Deve conter 8 números.', 'error');
            cepInput.focus();
            return;
        }
        // Validação se CEP está preenchido mas RA não (pode ajustar conforme regra de negócio)
        if (cepLimpo && !cidadeInput.value) {
            showToast('Se informar o CEP, por favor selecione a Região Administrativa.', 'error');
            cidadeInput.focus();
            return;
        }

        const dadosPaciente = {
            telefone: telefoneLimpo || null, // Envia null se vazio
            cep: cepLimpo || null,
            cidade: cidadeInput.value || null,
            estado: 'DF', // Mantém DF
            numero: numeroInput.value || null,
            complemento: complementoInput.value || null
        };

        // Mostra feedback de carregamento no botão
        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Salvando...';
        const errorDiv = document.getElementById('paciente-edit-error');
        errorDiv.style.display = 'none'; // Esconde erro anterior

        try {
            const response = await fetchAuthenticated('/api/usuarios/me/paciente', {
                method: 'PUT',
                body: JSON.stringify(dadosPaciente)
            });

            if (response && response.ok) {
                // Atualiza os dados locais com a resposta da API
                dadosUsuarioAtual = await response.json();
                showToast('Dados atualizados com sucesso!', 'success');
                renderMeuPerfil(); // Re-renderiza para mostrar os dados atualizados e esconder o form
            } else {
                await handleApiError(response, 'paciente-edit-error'); // Mostra erro no div do form
            }
        } catch (err) {
            console.error("Erro ao atualizar dados do paciente:", err);
            showToast('Erro de rede ao atualizar seus dados.', 'error');
            errorDiv.textContent = 'Erro de rede. Verifique sua conexão.';
            errorDiv.style.display = 'block';
        } finally {
            // Restaura o botão
            submitButton.disabled = false;
            submitButton.textContent = 'Salvar Alterações';
        }
    }

    // Função para alterar senha
    async function handleUpdatePassword(event) {
        event.preventDefault();
        const novaSenhaInput = document.getElementById('nova-senha');
        const confirmaSenhaInput = document.getElementById('confirma-senha');
        const novaSenha = novaSenhaInput.value;
        const confirmaSenha = confirmaSenhaInput.value;

        // Validações antes de enviar
        if (novaSenha.length < 6 || !/\d/.test(novaSenha)) {
            showToast('A nova senha não atende aos critérios mínimos.', 'error');
            novaSenhaInput.focus();
            return;
        }
        if (novaSenha !== confirmaSenha) {
            showToast('As senhas não coincidem.', 'error');
            confirmaSenhaInput.focus();
            return;
        }

        const dto = { senha: novaSenha };
        const submitButton = event.target.querySelector('button[type="submit"]');
        const errorDiv = document.getElementById('senha-error-message');
        submitButton.disabled = true;
        submitButton.textContent = 'Salvando...';
        errorDiv.style.display = 'none';

        try {
            // Usa o endpoint genérico de usuário para atualizar a senha
            const response = await fetchAuthenticated(`/api/usuarios/${idUsuarioLogado}`, {
                method: 'PUT',
                body: JSON.stringify(dto)
            });

            if (response && response.ok) {
                showToast('Senha alterada com sucesso! Você será deslogado por segurança.', 'success');
                setTimeout(logout, 3000); // Dá um tempo maior para o usuário ler
            } else {
                await handleApiError(response, 'senha-error-message');
                // Limpa os campos de senha em caso de erro
                novaSenhaInput.value = '';
                confirmaSenhaInput.value = '';
            }
        } catch (err) {
            console.error("Erro ao alterar senha:", err);
            showToast('Erro de rede ao alterar senha.', 'error');
            errorDiv.textContent = 'Erro de rede. Verifique sua conexão.';
            errorDiv.style.display = 'block';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Salvar Nova Senha';
        }
    }

    // --- Funções de formatação (máscaras) ---
    function formatTelefone(value) {
        if (!value) return "";
        value = value.replace(/\D/g, ''); // Remove tudo que não é dígito
        if (value.length <= 10) { // Fixo
            value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
            value = value.replace(/(\d{4})(\d)/, "$1-$2");
        } else { // Celular
            value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
            value = value.replace(/(\d{5})(\d)/, "$1-$2");
        }
        return value.slice(0, 15); // Limita ao formato (XX) XXXXX-XXXX
    }

    function formatCEP(value) {
        if (!value) return "";
        value = value.replace(/\D/g, '');
        value = value.replace(/^(\d{5})(\d)/, "$1-$2");
        return value.slice(0, 9); // Limita ao formato XXXXX-XXX
    }

    function formatCPF(value) {
        if (!value) return "";
        value = value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        return value.slice(0, 14); // Limita ao formato XXX.XXX.XXX-XX
    }


    // --- Funções de Agendamento ---
    async function renderTelaDeAgendamento() {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        contentDinamico.innerHTML = `<h3>Novo Agendamento</h3><p>Encontre um profissional para agendar sua consulta.</p><div id="filtros-container"></div><ul id="lista-medicos" class="medico-list">${SPINNER_HTML}</ul>`;

        try {
            const response = await fetchAuthenticated('/api/medicos');
            if (!response || !response.ok) throw new Error('Falha ao carregar médicos');
            todosOsMedicos = await response.json();

            renderFiltrosMedicos();
            renderListaMedicos();
        } catch (err) {
            console.error(err);
            document.getElementById('lista-medicos').innerHTML = '<li>Erro ao carregar médicos.</li>';
        }
    }

    function renderFiltrosMedicos() {
        const container = document.getElementById('filtros-container');
        if (!container) return;

        // Extrai opções únicas para os filtros de especialidade e região
        const especialidades = [...new Set(todosOsMedicos.map(m => m.especialidade))].sort();
        const regioes = [...new Set(todosOsMedicos.map(m => m.unidade?.nome).filter(Boolean))].sort(); // filter(Boolean) remove nulos/undefined

        let especialidadesOptions = especialidades.map(e => `<option value="${e}">${e.replace(/_/g, ' ')}</option>`).join('');
        let regioesOptions = regioes.map(r => `<option value="${r}">${r}</option>`).join('');

        container.innerHTML = `
            <div class="filter-bar">
                <div class="filter-group">
                    <label for="filtro-nome">Nome do Médico</label>
                    <input type="text" id="filtro-nome" placeholder="Digite o nome...">
                </div>
                <div class="filter-group">
                    <label for="filtro-especialidade">Especialidade</label>
                    <select id="filtro-especialidade">
                        <option value="">Todas</option>
                        ${especialidadesOptions}
                    </select>
                </div>
                <div class="filter-group">
                    <label for="filtro-regiao">Unidade de Saúde</label>
                    <select id="filtro-regiao">
                        <option value="">Todas</option>
                        ${regioesOptions}
                    </select>
                </div>
            </div>
        `;

        // Adiciona os listeners para os filtros
        document.getElementById('filtro-nome').addEventListener('input', renderListaMedicos);
        document.getElementById('filtro-especialidade').addEventListener('change', renderListaMedicos);
        document.getElementById('filtro-regiao').addEventListener('change', renderListaMedicos);
    }

    function renderListaMedicos() {
        const listaUL = document.getElementById('lista-medicos');
        listaUL.innerHTML = ''; // Limpa a lista antes de renderizar

        const nomeFiltro = document.getElementById('filtro-nome')?.value.toLowerCase() || '';
        const especialidadeFiltro = document.getElementById('filtro-especialidade')?.value || '';
        const regiaoFiltro = document.getElementById('filtro-regiao')?.value || '';

        const medicosFiltrados = todosOsMedicos.filter(medico => {
            // Só exibe médicos ativos
            if (!medico.ativo) return false;

            const matchNome = medico.nome.toLowerCase().includes(nomeFiltro);
            const matchEspecialidade = !especialidadeFiltro || medico.especialidade === especialidadeFiltro;
            // Verifica se a unidade existe antes de acessar o nome
            const matchRegiao = !regiaoFiltro || (medico.unidade && medico.unidade.nome === regiaoFiltro);

            return matchNome && matchEspecialidade && matchRegiao;
        });

        if (medicosFiltrados.length === 0) {
            listaUL.innerHTML = '<li>Nenhum médico encontrado com os filtros selecionados.</li>';
            return;
        }

        medicosFiltrados.forEach(medico => {
            const li = document.createElement('li');
            li.className = 'medico-item-clicavel'; // Mantém a classe original para estilo
            const especialidadeFormatada = medico.especialidade.replace(/_/g, ' ');
            const unidadeNome = medico.unidade ? medico.unidade.nome : 'N/A'; // Nome da unidade ou N/A
            li.innerHTML = `
                <div>
                    <strong>Dr(a). ${medico.nome}</strong><br>
                    <small>${especialidadeFormatada} | ${unidadeNome}</small>
                </div>
                <span>Ver horários &rarr;</span>`;
            li.addEventListener('click', () => renderDetalhesMedicoParaAgendamento(medico.id));
            listaUL.appendChild(li);
        });
    }

    async function renderDetalhesMedicoParaAgendamento(medicoId) {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        contentDinamico.innerHTML = `<div class="section-card">${SPINNER_HTML}</div>`; // Mostra spinner dentro de um card
        try {
            // Busca dados do médico, agenda e horários já ocupados em paralelo
            const [respMedico, respHorarios, respHorariosOcupados] = await Promise.all([
                fetchAuthenticated(`/api/medicos/${medicoId}`),
                fetchAuthenticated(`/api/medicos/${medicoId}/horarios`),
                fetchAuthenticated(`/api/agendamentos/medico/${medicoId}/horarios-ocupados`) // Endpoint que só retorna datas/horas
            ]);

            // Verifica se todas as respostas foram OK
            if (!respMedico || !respMedico.ok || !respHorarios || !respHorarios.ok || !respHorariosOcupados || !respHorariosOcupados.ok) {
                throw new Error('Não foi possível carregar os dados completos do médico.');
            }

            const medico = await respMedico.json();
            const agenda = await respHorarios.json();
            const horariosOcupadosISO = await respHorariosOcupados.json(); // Lista de strings ISO
            // Cria um Set para busca rápida dos horários ocupados
            const horariosAgendados = new Set(horariosOcupadosISO);

            let htmlAgenda = `
                <div class="section-card">
                    <div class="admin-section-header">
                        <h3>Agenda de Dr(a). ${medico.nome} (${medico.especialidade.replace(/_/g, ' ')})</h3>
                        <button class="btn btn-secondary" id="btn-voltar-lista">&larr; Voltar para Lista</button>
                    </div>`;

            if (!agenda || !agenda.dias || agenda.dias.length === 0) {
                htmlAgenda += '<p>Este médico não possui horários disponíveis cadastrados.</p>';
            } else {
                htmlAgenda += '<p>Selecione um horário disponível (em azul) para agendar:</p>';
                // Ordena os dias da semana para exibição consistente
                agenda.dias.sort((a, b) => DIAS_SEMANA_MAP[a.dia.toUpperCase()] - DIAS_SEMANA_MAP[b.dia.toUpperCase()]);

                agenda.dias.forEach(dia => {
                    htmlAgenda += `<div class="dia-agenda"><strong>${dia.dia.charAt(0) + dia.dia.slice(1).toLowerCase()}</strong><div class="horarios-grid">`;
                    // Ordena os horários dentro do dia
                    dia.horarios.sort();
                    dia.horarios.forEach(hora => {
                        // Calcula a próxima data/hora ISO para este slot
                        const dataSlotISO = getProximaDataISO(dia.dia, hora);
                        // Verifica se este slot já está agendado
                        const isAgendado = horariosAgendados.has(dataSlotISO);

                        htmlAgenda += `
                            <button
                                class="btn-horario ${isAgendado ? 'indisponivel' : ''}"
                                data-iso-datetime="${dataSlotISO}"
                                data-medico-id="${medico.id}"
                                data-medico-nome="${medico.nome}"
                                ${isAgendado ? 'disabled title="Horário indisponível"' : ''}>
                                ${hora}
                            </button>`;
                    });
                    htmlAgenda += `</div></div>`;
                });
            }
            htmlAgenda += `</div>`; // Fecha section-card
            contentDinamico.innerHTML = htmlAgenda;

            // Adiciona listeners aos botões
            document.getElementById('btn-voltar-lista').addEventListener('click', renderTelaDeAgendamento);
            document.querySelectorAll('.btn-horario:not(.indisponivel)').forEach(button => {
                button.addEventListener('click', () => renderFormularioSintomas(
                    button.dataset.isoDatetime,
                    button.dataset.medicoId,
                    button.dataset.medicoNome
                ));
            });
        } catch (err) {
            console.error("Erro ao carregar detalhes do médico:", err);
            contentDinamico.innerHTML = `<div class="section-card"><p>Erro ao carregar agenda do médico. Tente novamente mais tarde.</p><button class="btn btn-secondary" id="btn-voltar-lista">Voltar</button></div>`;
            // Garante que o botão de voltar funcione mesmo em caso de erro
            const btnVoltar = document.getElementById('btn-voltar-lista');
            if (btnVoltar) {
                btnVoltar.addEventListener('click', renderTelaDeAgendamento);
            }
        }
    }

    function renderFormularioSintomas(dataISO, medicoId, nomeMedico) {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        const dataFormatada = new Date(dataISO).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' });
        contentDinamico.innerHTML = `
            <div class="booking-form-container">
                <h4>Confirmar Agendamento</h4>
                <p>Médico(a): <strong>${nomeMedico}</strong><br>
                   Horário: <strong style="font-size: 1.1rem;">${dataFormatada}</strong></p>
                <form id="form-agendamento-final" style="margin-top: 1.5rem;">
                    <div id="booking-error-message" class="error-message" style="display:none;"></div>
                    <div class="input-group">
                        <label for="sintomas">Descreva seus Sintomas (obrigatório)</label>
                        <textarea id="sintomas" required rows="4"></textarea>
                    </div>
                    <div class="input-group">
                        <label for="diasSintomas">Está com sintomas há quantos dias?</label>
                        <input type="number" id="diasSintomas" min="0" placeholder="Ex: 3">
                    </div>
                    <div class="input-group">
                        <label for="alergias">Possui Alergias? (Opcional)</label>
                        <input type="text" id="alergias" placeholder="Ex: Dipirona, Penicilina...">
                    </div>
                    <div class="input-group">
                        <label for="cirurgias">Cirurgias Prévias? (Opcional)</label>
                        <input type="text" id="cirurgias" placeholder="Ex: Apendicite em 2010...">
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-success">Confirmar Agendamento</button>
                        <button type="button" class="btn btn-secondary" id="btn-cancelar-agendamento">Voltar aos Horários</button>
                    </div>
                </form>
            </div>`;
        document.getElementById('btn-cancelar-agendamento').addEventListener('click', () => renderDetalhesMedicoParaAgendamento(medicoId));
        document.getElementById('form-agendamento-final').addEventListener('submit', (e) => handleBookingSubmit(e, dataISO, medicoId));
    }

    async function handleBookingSubmit(event, dataISO, medicoId) {
        event.preventDefault();
        const sintomasInput = document.getElementById('sintomas');
        if (!sintomasInput.value || sintomasInput.value.trim() === '') {
            showToast('Por favor, descreva seus sintomas. Este campo é obrigatório.', 'error');
            sintomasInput.focus();
            return;
        }

        const diasSintomasValue = document.getElementById('diasSintomas').value;
        const agendamentoDTO = {
            idMedico: parseInt(medicoId),
            dataHora: dataISO,
            sintomas: sintomasInput.value,
            // Converte para número ou envia null se vazio
            diasSintomas: diasSintomasValue ? parseInt(diasSintomasValue, 10) : null,
            alergias: document.getElementById('alergias').value,
            cirurgias: document.getElementById('cirurgias').value
        };

        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Agendando...';
        const errorDiv = document.getElementById('booking-error-message');
        errorDiv.style.display = 'none';

        try {
            const response = await fetchAuthenticated('/api/agendamentos', {
                method: 'POST',
                body: JSON.stringify(agendamentoDTO)
            });

            if (response && response.ok) {
                showToast('Agendamento realizado com sucesso!', 'success');
                renderMeusAgendamentos(); // Vai para a tela de "Meus Agendamentos"
            } else if (response) {
                // Tenta exibir a mensagem de erro da API (ex: horário indisponível, já tem consulta)
                await handleApiError(response, 'booking-error-message');
            } else {
                // Caso response seja null (erro de autenticação tratado no fetchAuthenticated)
                showToast('Sua sessão pode ter expirado. Tente novamente.', 'error');
            }
        } catch (err) {
            console.error("Erro ao agendar consulta:", err);
            showToast('Erro de rede ao tentar agendar. Verifique sua conexão.', 'error');
            errorDiv.textContent = 'Erro de rede. Verifique sua conexão.';
            errorDiv.style.display = 'block';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Confirmar Agendamento';
        }
    }

    function showConfirmationModal(message, onConfirm) {
        const modal = document.getElementById('confirmation-modal');
        const messageP = document.getElementById('modal-message');
        const btnConfirm = document.getElementById('modal-btn-confirm');
        const btnCancel = document.getElementById('modal-btn-cancel');

        if (!modal || !messageP || !btnConfirm || !btnCancel) {
            console.error("Elementos do modal de confirmação não encontrados no HTML.");
            // Fallback para o confirm nativo se o modal não estiver pronto
            if (confirm(message)) {
                onConfirm();
            }
            return;
        }

        messageP.textContent = message;
        modal.style.display = 'flex'; // Mostra o modal

        // Usa AbortController para remover listeners antigos e evitar múltiplas execuções
        const controller = new AbortController();
        const { signal } = controller;

        const cleanup = () => {
            modal.style.display = 'none'; // Esconde o modal
            controller.abort(); // Remove os listeners associados a este sinal
        };

        btnConfirm.addEventListener('click', () => {
            onConfirm(); // Executa a ação de confirmação passada como argumento
            cleanup();
        }, { signal }); // Associa o listener ao sinal

        btnCancel.addEventListener('click', cleanup, { signal });

        // Permite fechar clicando fora do conteúdo do modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cleanup();
            }
        }, { signal });
    }

    // Renderiza Meus Agendamentos para incluir especialidade e endereço
    async function renderMeusAgendamentos() {
        const contentDinamico = document.getElementById('paciente-content-dinamico');
        contentDinamico.innerHTML = `
            <div class="section-card">
                <h3>Meus Agendamentos</h3>
                <div id="agendamentos-container">${SPINNER_HTML}</div>
            </div>
            <div id="detalhes-consulta-container" style="margin-top: 2rem;"></div>`;
        try {
            const response = await fetchAuthenticated('/api/agendamentos/meus');
            if (!response || !response.ok) throw new Error('Falha ao buscar agendamentos');
            const agendamentos = await response.json();

            // Separa agendamentos futuros e passados
            const agora = new Date();
            const proximosAgendamentos = agendamentos
                .filter(ag => (ag.status === 'PENDENTE' || ag.status === 'CONFIRMADO') && new Date(ag.dataHora) >= agora)
                .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

            const historicoAgendamentos = agendamentos
                .filter(ag => !(ag.status === 'PENDENTE' || ag.status === 'CONFIRMADO') || new Date(ag.dataHora) < agora)
                .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora)); // Histórico mais recente primeiro

            let html = '<h4>Próximos Agendamentos</h4>';
            if (proximosAgendamentos.length === 0) {
                html += '<p>Nenhum próximo agendamento encontrado.</p>';
            } else {
                html += '<ul class="medico-list">'; // Reutiliza a classe para consistência
                proximosAgendamentos.forEach(ag => {
                    const especialidadeFormatada = ag.medico.especialidade ? ag.medico.especialidade.replace(/_/g, ' ') : 'N/A';
                    const nomeUnidade = ag.medico.nomeUnidade || 'Unidade não informada';
                    const enderecoUnidade = ag.medico.enderecoUnidade || 'Endereço não disponível';
                    html += `
                        <li class="agendamento-card status-${ag.status}">
                            <div>
                                <strong>${new Date(ag.dataHora).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}</strong><br>
                                <small>Médico(a): ${ag.medico.nome} (${especialidadeFormatada})</small><br>
                                <small>Local: ${nomeUnidade} - ${enderecoUnidade}</small><br>
                                <small>Status: <span class="badge status-${ag.status}">${ag.status}</span></small>
                            </div>
                            <button class="btn btn-danger btn-cancelar-agendamento" data-id="${ag.id}">Cancelar</button>
                        </li>`;
                });
                html += '</ul>';
            }

            html += '<hr style="margin: 2rem 0;"><h4>Histórico de Agendamentos</h4>';
            if (historicoAgendamentos.length === 0) {
                html += '<p>Nenhum agendamento no seu histórico.</p>';
            } else {
                html += '<div class="history-grid">'; // Usa grid para o histórico
                historicoAgendamentos.forEach(ag => {
                    const especialidadeFormatada = ag.medico.especialidade ? ag.medico.especialidade.replace(/_/g, ' ') : 'N/A';
                    const nomeUnidade = ag.medico.nomeUnidade || 'Unidade não informada';
                    const statusFormatado = ag.status.replace(/_/g, ' '); // Formata status como "NAO COMPARECEU"
                    html += `
                    <div class="history-card status-${ag.status}">
                        <div class="history-card-header">
                            <strong>${new Date(ag.dataHora).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</strong><br>
                            <small>Médico(a): ${ag.medico.nome} (${especialidadeFormatada})</small><br>
                            <small>Local: ${nomeUnidade}</small>
                        </div>
                         <div class="history-card-footer">
                            <span class="badge status-${ag.status}">${statusFormatado}</span>
                            ${ag.status === 'ATENDIDO' ? `<button class="btn btn-secondary btn-sm" style="float: right;" onclick="handleVerDetalhesConsulta(${ag.id})">Ver Detalhes</button>` : ''}
                        </div>
                    </div>`;
                });
                html += '</div>';
            }
            document.getElementById('agendamentos-container').innerHTML = html;
            // Adiciona listeners aos botões de cancelar
            document.querySelectorAll('.btn-cancelar-agendamento').forEach(btn => btn.addEventListener('click', () => handleCancelarAgendamento(btn.dataset.id)));
        } catch (err) {
            console.error("Erro ao renderizar agendamentos:", err);
            document.getElementById('agendamentos-container').innerHTML = '<p>Erro ao carregar seus agendamentos.</p>';
        }
    }


    async function handleCancelarAgendamento(agendamentoId) {
        showConfirmationModal('Tem certeza que deseja cancelar este agendamento?', async () => {
            try {
                // Chama o endpoint específico para cancelamento pelo paciente
                const response = await fetchAuthenticated(`/api/agendamentos/${agendamentoId}/cancelar`, { method: 'PUT' });

                if (response && response.ok) {
                    showToast('Agendamento cancelado com sucesso!', 'success');
                    await renderMeusAgendamentos(); // Atualiza a lista
                } else if (response) {
                    // Trata erros específicos da API (ex: agendamento já passou, não pode cancelar)
                    await handleApiError(response, null); // Mostra erro via Toast
                } else {
                    showToast('Sua sessão pode ter expirado. Tente novamente.', 'error');
                }
            } catch (err) {
                console.error("Erro ao cancelar agendamento:", err);
                showToast('Erro de rede ao tentar cancelar. Verifique sua conexão.', 'error');
            }
        });
    }

    // Mantido global para ser chamado pelo onclick no HTML gerado
    window.handleVerDetalhesConsulta = async (agendamentoId) => {
        const container = document.getElementById('detalhes-consulta-container');
        container.innerHTML = `<div class="document-view">${SPINNER_HTML}</div>`; // Mostra spinner

        try {
            // Busca prescrição, atestado e exames associados ao agendamento
            const [respPresc, respAtest, respExames, respFicha] = await Promise.all([
                fetchAuthenticated(`/api/prescricoes/agendamento/${agendamentoId}`),
                fetchAuthenticated(`/api/atestados/agendamento/${agendamentoId}`),
                fetchAuthenticated(`/api/exames/agendamento/${agendamentoId}`),
                fetchAuthenticated(`/api/fichas-medicas/agendamento/${agendamentoId}`) // Busca a ficha médica
            ]);

            // Processa as respostas. Se não encontrar, trata como null ou array vazio.
            const prescricao = (respPresc && respPresc.ok) ? await respPresc.json().catch(() => null) : null;
            const atestado = (respAtest && respAtest.ok) ? await respAtest.json().catch(() => null) : null;
            const exames = (respExames && respExames.ok) ? await respExames.json().catch(() => []) : [];
            const fichaMedica = (respFicha && respFicha.ok) ? await respFicha.json().catch(() => null) : null;

            let detailsHtml = `
                <div class="document-view">
                    <div class="admin-section-header">
                        <h4>Detalhes da Consulta</h4>
                        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('detalhes-consulta-container').innerHTML = ''">Fechar</button>
                    </div>`;

            // Mostra a evolução médica da ficha, se existir
            if (fichaMedica && fichaMedica.evolucaoMedica) {
                detailsHtml += `<div class="document-section"><h5>Evolução Médica</h5><pre>${fichaMedica.evolucaoMedica}</pre></div>`;
            }

            if (prescricao) {
                detailsHtml += `<div class="document-section"><h5>Prescrição Médica</h5><pre>${prescricao.medicamentos}</pre></div>`;
            }
            if (atestado) {
                detailsHtml += `<div class="document-section"><h5>Atestado</h5><pre>${atestado.descricao}</pre></div>`;
            }
            if (exames.length > 0) {
                detailsHtml += `<div class="document-section"><h5>Exames Solicitados</h5><ul>`;
                exames.forEach(ex => {
                    // Mostra o resultado se disponível
                    const resultado = ex.resultado ? `: ${ex.resultado}` : ' (Resultado pendente)';
                    detailsHtml += `<li><strong>${ex.tipo}</strong>${resultado}</li>`;
                });
                detailsHtml += `</ul></div>`;
            }
            // Se nenhuma das seções acima foi adicionada
            if (!prescricao && !atestado && exames.length === 0 && (!fichaMedica || !fichaMedica.evolucaoMedica)) {
                detailsHtml += '<p>Nenhuma informação adicional (evolução, prescrição, atestado ou exame) registrada para esta consulta.</p>';
            }
            detailsHtml += '</div>'; // Fecha document-view

            container.innerHTML = detailsHtml;
            container.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Rola suavemente para a seção

        } catch (err) {
            console.error('Erro ao buscar detalhes da consulta:', err);
            showToast('Erro ao carregar detalhes da consulta. Tente novamente.', 'error');
            container.innerHTML = ''; // Limpa em caso de erro
        }
    }

    // Inicia o dashboard do paciente
    initPacienteDashboard();
});

