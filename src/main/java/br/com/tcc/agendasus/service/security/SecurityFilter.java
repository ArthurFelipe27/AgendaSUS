package br.com.tcc.agendasus.service.security;

import java.io.IOException;
import java.util.Optional;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import br.com.tcc.agendasus.model.entity.Usuario; // Import necessário
import br.com.tcc.agendasus.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;

    public SecurityFilter(TokenService tokenService, UsuarioRepository usuarioRepository) {
        this.tokenService = tokenService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, 
                                    @NonNull HttpServletResponse response, 
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        var tokenJWT = recuperarToken(request);

        if (tokenJWT != null) {
            var subject = tokenService.getSubject(tokenJWT);
            if (subject != null) {
                Optional<Usuario> optionalUsuario = usuarioRepository.findByEmail(subject);
                if (optionalUsuario.isPresent()) {
                    var usuario = optionalUsuario.get();
                    var authentication = new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }

        // --- NOSSO NOVO CÓDIGO DE DEBUG ---
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("==================== DEBUG SPRING SECURITY ====================");
        System.out.println("URL da Requisição: " + request.getMethod() + " " + request.getRequestURI());

        if (authentication != null && authentication.isAuthenticated()) {
            System.out.println("Usuário Autenticado: " + authentication.getName());
            System.out.println("Permissões (Authorities): " + authentication.getAuthorities());
        } else {
            System.out.println("Usuário: ANÔNIMO");
        }
        System.out.println("=============================================================");
        // --- FIM DO CÓDIGO DE DEBUG ---

        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        var authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null) {
            return authorizationHeader.replace("Bearer ", "");
        }
        return null;
    }
}