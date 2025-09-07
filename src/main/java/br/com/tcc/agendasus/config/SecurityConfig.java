package br.com.tcc.agendasus.config;

import br.com.tcc.agendasus.service.security.SecurityFilter;
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
                        
                        // --- 1. REGRAS PÚBLICAS DA API ---
                        .requestMatchers(HttpMethod.POST, "/api/login", "/api/usuarios").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/conteudo/publico/**").permitAll()

                        // --- 2. LIBERAÇÃO DE ARQUIVOS ESTÁTICOS ---
                        .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll() 
                        .requestMatchers("/", "/login.html", "/cadastro.html", "/dashboard.html", "/paciente_dashboard.html", "/medico_dashboard.html", "/diretor_dashboard.html", "/*.html").permitAll()

                        // --- 3. REGRAS AUTENTICADAS (O RESTO DA API) ---
                        .requestMatchers(HttpMethod.GET, "/api/usuarios/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/usuarios/{id}").hasRole("DIRETOR")
                        
                        .requestMatchers(HttpMethod.POST, "/api/medicos").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.GET, "/api/medicos", "/api/medicos/{id}", "/api/medicos/{id}/horarios").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/medicos/{id}").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/medicos/{id}").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.PUT, "/api/medicos/horarios").hasRole("MEDICO")
                        
                        .requestMatchers(HttpMethod.POST, "/api/agendamentos").hasRole("PACIENTE") 
                        .requestMatchers(HttpMethod.GET, "/api/agendamentos/meus").hasAnyRole("PACIENTE", "MEDICO")
                        .requestMatchers(HttpMethod.GET, "/api/agendamentos/todos").hasRole("DIRETOR")
                        .requestMatchers(HttpMethod.PUT, "/api/agendamentos/{id}/status").hasRole("MEDICO")
                        .requestMatchers(HttpMethod.PUT, "/api/agendamentos/{id}/cancelar").hasRole("PACIENTE")

                        .requestMatchers("/api/prescricoes/**").authenticated() 
                        .requestMatchers("/api/atestados/**").authenticated()
                        .requestMatchers("/api/exames/**").authenticated()
                        .requestMatchers("/api/conteudo/admin/**").hasRole("DIRETOR")

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