package br.com.tcc.agendasus.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.tcc.agendasus.dto.DTOs.ForgotPasswordRequestDTO;
import br.com.tcc.agendasus.dto.DTOs.ResetPasswordRequestDTO;
import br.com.tcc.agendasus.service.UsuarioService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final UsuarioService usuarioService;

    public PublicController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody @Valid ForgotPasswordRequestDTO dados) {
        String token = usuarioService.gerarTokenResetSenha(dados);
        Map<String, String> response = Map.of(
            "message", "Token de redefinição gerado. Em um sistema real, ele seria enviado para seu e-mail.",
            "resetToken", token
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody @Valid ResetPasswordRequestDTO dados) {
        usuarioService.redefinirSenha(dados);
        return ResponseEntity.ok(Map.of("message", "Senha redefinida com sucesso!"));
    }
}
