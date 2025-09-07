package br.com.tcc.agendasus.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.tcc.agendasus.dto.LoginDTO;
import br.com.tcc.agendasus.dto.TokenDTO; // Import necessário
import br.com.tcc.agendasus.model.entity.Usuario;
import br.com.tcc.agendasus.service.security.TokenService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/login")
public class AuthenticationController {

    private final AuthenticationManager manager;
    private final TokenService tokenService;

    public AuthenticationController(AuthenticationManager manager, TokenService tokenService) {
        this.manager = manager;
        this.tokenService = tokenService;
    }

    @PostMapping
    public ResponseEntity<TokenDTO> efetuarLogin(@RequestBody @Valid LoginDTO dados) {
        var authenticationToken = new UsernamePasswordAuthenticationToken(dados.email(), dados.senha());
        var authentication = manager.authenticate(authenticationToken);

        var usuario = (Usuario) authentication.getPrincipal();
        var tokenJWT = tokenService.gerarToken(usuario);
        var role = usuario.getRole().name();
        var nome = usuario.getNome();

        return ResponseEntity.ok(new TokenDTO(tokenJWT, role, nome));
    }
}