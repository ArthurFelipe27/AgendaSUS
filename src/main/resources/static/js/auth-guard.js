// Este script verifica se o usuário está autenticado antes de carregar as páginas protegidas.
// Ele é executado imediatamente para bloquear o acesso o mais rápido possível.
(function () {
    // 1. Pega o token salvo no localStorage.
    const token = localStorage.getItem('jwtToken');
    const currentPath = window.location.pathname;

    // 2. Define quais páginas são públicas e não precisam de guarda.
    const publicPages = ['/login.html', '/cadastro.html', '/esqueci-senha.html', '/redefinir-senha.html', '/'];

    // 3. Verifica se o token NÃO existe E se a página atual NÃO é uma das páginas públicas.
    if (!token && !publicPages.some(page => currentPath.endsWith(page))) {
        // 4. Se não há token e a página é protegida, redireciona o usuário para o login.
        window.location.href = 'login.html';
    }
})();
