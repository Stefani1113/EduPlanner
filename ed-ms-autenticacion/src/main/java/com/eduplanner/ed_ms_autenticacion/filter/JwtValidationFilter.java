package com.eduplanner.ed_ms_autenticacion.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.eduplanner.ed_ms_autenticacion.service.JwtService;
import com.eduplanner.ed_ms_autenticacion.service.TokenBlacklistService;

import java.io.IOException;

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

        if (tokenBlacklistService.isBlacklisted(token)) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Sesión cerrada. Por favor inicie sesión nuevamente.");
            return;
        }

        try {
            if (jwtService.isTokenValid(token)) {
                request.setAttribute("idUser", jwtService.extractIdUser(token));
                request.setAttribute("role", jwtService.extractRole(token)); 
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
        System.out.println("URI: " + request.getRequestURI());
        System.out.println("CONTEXT PATH: " + request.getContextPath());
        System.out.println("SERVLET PATH: " + request.getServletPath());

        String path = request.getRequestURI();

        return path.startsWith("/eduplanner/auth/login")
                        || path.startsWith("/eduplanner/auth/forgot-password")
                        || path.startsWith("/eduplanner/auth/reset-password")
                        || path.startsWith("/eduplanner/auth/activation-account") 
                        || path.startsWith("/eduplanner/internal/tokens");
    }

    private void sendError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"mensaje\": \"" + message + "\"}");
    }
}