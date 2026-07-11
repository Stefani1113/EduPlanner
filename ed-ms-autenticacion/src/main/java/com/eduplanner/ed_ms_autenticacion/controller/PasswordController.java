package com.eduplanner.ed_ms_autenticacion.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eduplanner.ed_lib_common.dto.ForgotPasswordRequestDTO;
import com.eduplanner.ed_lib_common.dto.ResetPasswordRequestDTO;
import com.eduplanner.ed_ms_autenticacion.service.PasswordService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
/**
 * Rutas de solicitar y actualizar contraseña
 * PasswordController
 */
public class PasswordController {
    
    private final PasswordService passwordService;

    /**
     * POST /auth/forgot-password
     * Recibe el correo y dispara el envio del enlace de recupración
     * @param request
     * @return
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        String result = passwordService.forgotPassword(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", result);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /auth/reset-password
     * Recibe token mas contraseña nueva y la actualiza
     * @param request
     * @return
     */
    @PutMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        String result = passwordService.resetPassword(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", result);
        return ResponseEntity.ok(response);
    }
}
