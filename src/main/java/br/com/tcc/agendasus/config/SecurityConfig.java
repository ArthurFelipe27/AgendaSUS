package br.com.tcc.agendasus.config;

import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
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
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        
                        // --- 1. REGRAS PÚBLICAS (PERMIT ALL) ---
                        // APIs Públicas
                        .requestMatchers(HttpMethod.POST, "/api/login", "/api/usuarios").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/public/**").permitAll() // Para recuperação de senha
                        .requestMatchers(HttpMethod.GET, "/api/conteudo/publico/**").permitAll()
                        
                        // Arquivos Estáticos do Frontend
                        .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll() 
                        .requestMatchers("/", "/*.html").permitAll() // Permite todos os HTMLs na raiz

                        // --- 2. REGRAS AUTENTICADAS (API) ---
                        // Usuário
                        .requestMatchers(HttpMethod.GET, "/api/usuarios/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/usuarios/{id}").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.PUT, "/api/usuarios/{id}").authenticated() // Para alterar a própria senha

                        // Unidade de Saúde
                        .requestMatchers(HttpMethod.POST, "/api/unidades-saude").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.GET, "/api/unidades-saude").authenticated()
                        
                        // Médicos
                        .requestMatchers(HttpMethod.PUT, "/api/medicos/horarios").hasRole("MEDICO") 
                        .requestMatchers(HttpMethod.POST, "/api/medicos").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.GET, "/api/medicos", "/api/medicos/{id}", "/api/medicos/{id}/horarios").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/medicos/{id}").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/medicos/{id}").hasRole("DIRETOR") 
                        
                        // Agendamentos e Prontuário
                        .requestMatchers(HttpMethod.POST, "/api/agendamentos").hasRole("PACIENTE") 
                        .requestMatchers(HttpMethod.GET, "/api/agendamentos/meus").hasAnyRole("PACIENTE", "MEDICO")
                        .requestMatchers(HttpMethod.GET, "/api/agendamentos/todos").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.PUT, "/api/agendamentos/{id}/status").hasRole("MEDICO")
                        .requestMatchers(HttpMethod.PUT, "/api/agendamentos/{id}/cancelar").hasRole("PACIENTE")
                        .requestMatchers(HttpMethod.GET, "/api/agendamentos/{id}/prontuario").hasAnyRole("MEDICO", "DIRETOR")
                        .requestMatchers(HttpMethod.POST, "/api/agendamentos/{id}/finalizar").hasRole("MEDICO")

                        // Ficha Médica
                        .requestMatchers(HttpMethod.GET, "/api/fichas-medicas/agendamento/{agendamentoId}").hasAnyRole("MEDICO", "DIRETOR")

                        // Pós-Consulta
                        .requestMatchers(HttpMethod.POST, "/api/prescricoes").hasRole("MEDICO")
                        .requestMatchers(HttpMethod.GET, "/api/prescricoes/meus").hasAnyRole("PACIENTE", "MEDICO")
                        .requestMatchers(HttpMethod.GET, "/api/prescricoes/todas").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.GET, "/api/prescricoes/agendamento/{id}").hasAnyRole("PACIENTE", "MEDICO")
                        
                        .requestMatchers(HttpMethod.POST, "/api/atestados").hasRole("MEDICO")
                        .requestMatchers(HttpMethod.GET, "/api/atestados/meus").hasAnyRole("PACIENTE", "MEDICO")
                        .requestMatchers(HttpMethod.GET, "/api/atestados/todas").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.GET, "/api/atestados/agendamento/{id}").hasAnyRole("PACIENTE", "MEDICO")
                        
                        .requestMatchers(HttpMethod.PUT, "/api/exames/{id}/resultado").hasRole("MEDICO")
                        .requestMatchers(HttpMethod.POST, "/api/exames").hasRole("MEDICO")
                        .requestMatchers(HttpMethod.GET, "/api/exames/meus").hasAnyRole("PACIENTE", "MEDICO")
                        .requestMatchers(HttpMethod.GET, "/api/exames/todas").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.GET, "/api/exames/agendamento/{id}").hasAnyRole("PACIENTE", "MEDICO")
                        
                        // Conteúdo Admin
                        .requestMatchers(HttpMethod.POST, "/api/conteudo/admin").hasAnyRole("DIRETOR", "MEDICO")
                        .requestMatchers(HttpMethod.GET, "/api/conteudo/admin/todos").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.PUT, "/api/conteudo/admin/{id}").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/conteudo/admin/{id}").hasRole("DIRETOR")

                        // --- 3. REGRA FINAL ---
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