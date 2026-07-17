package com.eduplanner.ed_ms_autenticacion.controller;

import com.eduplanner.ed_lib_comun.dto.ForgotPasswordRequestDTO;
import com.eduplanner.ed_lib_comun.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_comun.dto.JwtDTO;
import com.eduplanner.ed_lib_comun.dto.LoginRequestDTO;
import com.eduplanner.ed_lib_comun.dto.LoginResponseDTO;
import com.eduplanner.ed_lib_comun.dto.ResetPasswordRequestDTO;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;


@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class LoginController {

    //private final AuthService authService;

    /**
     * RF 1.2 / RF 1.2.1 / RF 1.2.1.1
     * POST /eduplanner/auth/login
     * Autentica con correo + contraseña. Respuesta inmediata con mensajes descriptivos.
     */
    @PostMapping("/login")
    public ResponseEntity<HttpGlobalResponse<LoginResponseDTO>> login(
            @Valid @RequestBody LoginRequestDTO request) {
        HttpGlobalResponse<LoginResponseDTO> response = authService.login(request);
        if (response.getData() == null) {
            // RF 1.2.1.1 - Error de credenciales, respuesta inmediata
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * GET /eduplanner/auth/refresh
     * Renueva el token antes de que expire.
     */
    @GetMapping("/refresh")
    public ResponseEntity<JwtDTO> refresh(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return ResponseEntity.ok(authService.refreshToken(authHeader.substring(7)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}