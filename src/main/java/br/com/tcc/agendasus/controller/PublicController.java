package br.com.tcc.agendasus.controller;

import br.com.tcc.agendasus.dto.ForgotPasswordRequestDTO;
import br.com.tcc.agendasus.dto.ResetPasswordRequestDTO;
import br.com.tcc.agendasus.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map; // Import necessário

@RestController
@RequestMapping("/api/public") // Todas as rotas aqui são públicas
public class PublicController {

    private final UsuarioService usuarioService;

    public PublicController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody @Valid ForgotPasswordRequestDTO dados) {
        String token = usuarioService.gerarTokenResetSenha(dados);
        
        // Retornamos um JSON simples contendo o token
        Map<String, String> response = Map.of(
            "message", "Token de redefinição gerado. Em um sistema real, ele seria enviado para seu e-mail.",
            "resetToken", token
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody @Valid ResetPasswordRequestDTO dados) {
        usuarioService.redefinirSenha(dados);
        
        Map<String, String> response = Map.of("message", "Senha redefinida com sucesso!");
        return ResponseEntity.ok(response);
    }
}