package br.com.tcc.agendasus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import br.com.tcc.agendasus.service.security.SecurityFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final SecurityFilter securityFilter;

    public SecurityConfig(SecurityFilter securityFilter) {
        this.securityFilter = securityFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Endpoints Públicos
                        .requestMatchers(HttpMethod.POST, "/api/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll() // Cadastro de Paciente
                        .requestMatchers("/api/public/**").permitAll()
                        
                        // Conteúdo Público
                        .requestMatchers(HttpMethod.GET, "/api/conteudo/publico/**").permitAll()

                        // Arquivos Estáticos (HTML, CSS, JS, favicon)
                        .requestMatchers("/", "/*.html", "/favicon.ico", "/css/**", "/js/**").permitAll()

                        // Endpoints de Admin (Diretor)
                        .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/usuarios/{id:\\d+}").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.POST, "/api/medicos").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.PUT, "/api/medicos/{id:\\d+}").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.POST, "/api/unidades-saude").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.GET, "/api/agendamentos/todos").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.GET, "/api/conteudo/admin/todos").hasRole("DIRETOR")

                        // Endpoints de Conteúdo para Médico e Diretor
                        .requestMatchers(HttpMethod.POST, "/api/conteudo/admin").hasAnyRole("MEDICO", "DIRETOR")
                        .requestMatchers(HttpMethod.GET, "/api/conteudo/meus").hasRole("MEDICO")
                        
                        // [CORREÇÃO] Permite que usuários autenticados acessem. A lógica de permissão (dono vs diretor) fica no Service.
                        .requestMatchers(HttpMethod.GET, "/api/conteudo/admin/{id:\\d+}").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/conteudo/admin/{id:\\d+}").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/conteudo/admin/{id:\\d+}").authenticated()

                        // Endpoints de Médico
                        .requestMatchers(HttpMethod.PUT, "/api/medicos/horarios").hasRole("MEDICO")
                        .requestMatchers(HttpMethod.POST, "/api/agendamentos/{id:\\d+}/finalizar").hasRole("MEDICO")
                        .requestMatchers(HttpMethod.PUT, "/api/agendamentos/{id:\\d+}/status").hasRole("MEDICO")
                        .requestMatchers(HttpMethod.PUT, "/api/exames/{id:\\d+}/resultado").hasRole("MEDICO")

                        // Endpoints de Paciente
                        .requestMatchers(HttpMethod.POST, "/api/agendamentos").hasRole("PACIENTE")
                        .requestMatchers(HttpMethod.PUT, "/api/agendamentos/{id:\\d+}/cancelar").hasRole("PACIENTE")
                        
                        // Endpoints para múltiplos perfis (Médico E Diretor)
                        .requestMatchers(HttpMethod.GET, "/api/agendamentos/{id:\\d+}/prontuario").hasAnyRole("MEDICO", "DIRETOR")

                        // Endpoints para QUALQUER usuário autenticado
                        .requestMatchers("/api/usuarios/me").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/usuarios/{id:\\d+}").authenticated() // Para alterar a própria senha
                        .requestMatchers(HttpMethod.GET, "/api/medicos/**").authenticated() 
                        .requestMatchers(HttpMethod.GET, "/api/unidades-saude").authenticated()
                        .requestMatchers("/api/agendamentos/meus").authenticated()
                        .requestMatchers("/api/prescricoes/**").authenticated()
                        .requestMatchers("/api/atestados/**").authenticated()
                        .requestMatchers("/api/exames/**").authenticated()

                        // Todas as outras requisições devem ser autenticadas
                        .anyRequest().authenticated()
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

