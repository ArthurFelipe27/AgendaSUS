package br.com.tcc.agendasus.config.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice; // Import necessário

@RestControllerAdvice 
public class GlobalExceptionHandler {

    // Um DTO 'record' privado apenas para esta classe
    private record ErrorResponse(String message) {}

    /**
     * Captura exceções de validação de negócio (dados duplicados, regras de negócio quebradas)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        ErrorResponse error = new ErrorResponse(ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error); // Retorna 409 CONFLICT
    }

    /**
     * Captura exceções de permissão (ex: Paciente tentando cancelar consulta de outro)
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        ErrorResponse error = new ErrorResponse(ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error); // Retorna 403 FORBIDDEN
    }

    /**
     * Captura exceções de "não encontrado" ou outras exceções de runtime
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        if (ex.getMessage().contains("não encontrado")) {
            ErrorResponse error = new ErrorResponse(ex.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error); // Retorna 404 NOT FOUND
        }
        
        // Se for outra RuntimeException não esperada, é um erro de servidor
        ErrorResponse error = new ErrorResponse("Erro interno no servidor: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}