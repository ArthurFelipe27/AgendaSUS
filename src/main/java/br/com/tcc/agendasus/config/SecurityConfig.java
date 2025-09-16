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
                        
                        // --- 1. REGRAS PÚBLICAS (API e Frontend) ---
                        .requestMatchers(HttpMethod.POST, "/api/login", "/api/usuarios").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/public/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/conteudo/publico/**").permitAll()
                        .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll() 
                        .requestMatchers("/", "/login.html", "/cadastro.html", "/paciente_dashboard.html", "/medico_dashboard.html", "/diretor_dashboard.html", "/*.html").permitAll()

                        // --- 2. REGRAS AUTENTICADAS (API) ---
                        .requestMatchers(HttpMethod.GET, "/api/usuarios/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/usuarios/{id}").hasRole("DIRETOR")
                        
                        // Médicos (Ordem correta)
                        .requestMatchers(HttpMethod.PUT, "/api/medicos/horarios").hasRole("MEDICO") 
                        .requestMatchers(HttpMethod.POST, "/api/medicos").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.GET, "/api/medicos", "/api/medicos/{id}", "/api/medicos/{id}/horarios").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/medicos/{id}").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/medicos/{id}").hasRole("DIRETOR") 
                        .requestMatchers(HttpMethod.POST, "/api/unidades-saude").hasRole("DIRETOR")
    .requestMatchers(HttpMethod.GET, "/api/unidades-saude").authenticated()

                        
                        // Agendamentos
                        .requestMatchers(HttpMethod.POST, "/api/agendamentos").hasRole("PACIENTE") 
                        .requestMatchers(HttpMethod.GET, "/api/agendamentos/meus").hasAnyRole("PACIENTE", "MEDICO")
                        .requestMatchers(HttpMethod.GET, "/api/agendamentos/todos").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.PUT, "/api/agendamentos/{id}/status").hasRole("MEDICO")
                        .requestMatchers(HttpMethod.PUT, "/api/agendamentos/{id}/cancelar").hasRole("PACIENTE")
                        .requestMatchers(HttpMethod.GET, "/api/fichas-medicas/agendamento/{agendamentoId}").hasAnyRole("MEDICO", "DIRETOR")

                        // Pós-Consulta
                        .requestMatchers(HttpMethod.POST, "/api/prescricoes").hasRole("MEDICO")
                        .requestMatchers(HttpMethod.GET, "/api/prescricoes/meus").hasAnyRole("PACIENTE", "MEDICO")
                        .requestMatchers(HttpMethod.GET, "/api/prescricoes/todas").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.POST, "/api/atestados").hasRole("MEDICO")
                        .requestMatchers(HttpMethod.GET, "/api/atestados/meus").hasAnyRole("PACIENTE", "MEDICO")
                        .requestMatchers(HttpMethod.GET, "/api/atestados/todas").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.PUT, "/api/exames/{id}/resultado").hasRole("MEDICO")
                        .requestMatchers(HttpMethod.POST, "/api/exames").hasRole("MEDICO")
                        .requestMatchers(HttpMethod.GET, "/api/exames/meus").hasAnyRole("PACIENTE", "MEDICO")
                        .requestMatchers(HttpMethod.GET, "/api/exames/todas").hasRole("DIRETOR")
                        
                        // --- 3. REGRAS DE CONTEÚDO (AQUI ESTÁ A CORREÇÃO) ---
                        .requestMatchers(HttpMethod.POST, "/api/conteudo/admin").hasAnyRole("DIRETOR", "MEDICO") // Diretor E Médico podem CRIAR
                        .requestMatchers(HttpMethod.GET, "/api/conteudo/admin/todos").hasRole("DIRETOR")       // Apenas Diretor pode ver TUDO
                        .requestMatchers(HttpMethod.PUT, "/api/conteudo/admin/{id}").hasRole("DIRETOR")        // Apenas Diretor pode ATUALIZAR (Aprovar)
                        .requestMatchers(HttpMethod.DELETE, "/api/conteudo/admin/{id}").hasRole("DIRETOR")    // Apenas Diretor pode DELETAR

                        // --- 4. REGRA FINAL ---
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