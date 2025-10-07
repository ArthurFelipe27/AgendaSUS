package br.com.tcc.agendasus.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.tcc.agendasus.dto.DTOs.*;
import br.com.tcc.agendasus.dto.DTOs.LoginDTO;
import br.com.tcc.agendasus.dto.DTOs.TokenDTO;
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
        var authToken = new UsernamePasswordAuthenticationToken(dados.email(), dados.senha());
        var authentication = manager.authenticate(authToken);
        var usuario = (Usuario) authentication.getPrincipal();
        
        String tokenJWT = tokenService.gerarToken(usuario);
        
        return ResponseEntity.ok(new TokenDTO(tokenJWT, usuario.getRole().name(), usuario.getNome()));
    }
}

