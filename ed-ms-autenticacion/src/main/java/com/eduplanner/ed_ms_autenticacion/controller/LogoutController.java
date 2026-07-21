package com.eduplanner.ed_ms_autenticacion.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_ms_autenticacion.service.TokenBlacklistService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;

@AllArgsConstructor
@RestController
@RequestMapping("/auth")
public class LogoutController {
    
    private final TokenBlacklistService tokenBlacklistService;

    /**
     * POST /eduplanner/auth/logout
     * Cierre de seión e invalidación de token
     */
    @PostMapping("/logout")
    public ResponseEntity<HttpGlobalResponse<Void>> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        HttpGlobalResponse<Void> resp = new HttpGlobalResponse<>();

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            resp.setMessage("No se encontró token de sesión");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
        }

        tokenBlacklistService.blacklist(authHeader.substring(7));
        resp.setMessage("Sesión cerrada correctamente");
        return ResponseEntity.ok(resp);
    }
}
