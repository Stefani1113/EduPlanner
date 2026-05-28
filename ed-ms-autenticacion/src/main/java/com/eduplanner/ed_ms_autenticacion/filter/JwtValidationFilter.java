package com.eduplanner.ed_ms_autenticacion.filter;

import com.eduplanner.ed_ms_autenticacion.service.JwtService;
import com.eduplanner.ed_ms_autenticacion.service.TokenBlacklistService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * RF 1.2.1 - Valida el JWT en cada petición protegida.
 * RF 1.6    - Rechaza tokens revocados (sesión cerrada).
 */
@Component
@RequiredArgsConstructor
@Log4j2
public class JwtValidationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Header Authorization ausente o inválido");
            return;
        }

        String token = authHeader.substring(7);

        // RF 1.6 - Token revocado por logout
        if (tokenBlacklistService.isBlacklisted(token)) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Sesión cerrada. Por favor inicie sesión nuevamente.");
            return;
        }

        try {
            if (jwtService.isTokenValid(token)) {
                request.setAttribute("email",     jwtService.extractEmail(token));
                request.setAttribute("idUser",  jwtService.extractIdUser(token));
                request.setAttribute("idRole",      jwtService.extractIdRole(token));
                filterChain.doFilter(request, response);
            } else {
                sendError(response, HttpServletResponse.SC_UNAUTHORIZED,
                        "Token inválido o expirado");
            }
        } catch (Exception e) {
            log.error("Error validando token: {}", e.getMessage());
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Error de validación del token");
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Solo el login es público
        return path.startsWith("/eduplanner/auth/login")
                        || path.startsWith("/eduplanner/auth/forgot-password")
                        || path.startsWith("/eduplanner/auth/reset-password");
    }

    private void sendError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"mensaje\": \"" + message + "\"}");
    }
}
