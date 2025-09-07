// Colocamos todo o nosso código dentro de uma função anônima
// e a executamos imediatamente com os () no final.
// Isso cria um "escopo privado" e evita que a const 'token'
// colida com outros scripts.
(function () {

    // 1. Pega o token salvo no localStorage
    const token = localStorage.getItem('jwtToken');

    // 2. Verifica se o token NÃO existe E se não estamos nas páginas públicas
    if (!token &&
        !window.location.pathname.endsWith('/login.html') &&
        !window.location.pathname.endsWith('/cadastro.html')) {

        // 3. Se não há token, expulsa o usuário
        window.location.href = 'login.html';
    }

})(); // <-- Os parênteses aqui executam a função imediatamente.