// ed-ms-administracion/src/main/java/com/eduplanner/ed_ms_administracion/filter/JwtValidationFilter.java
package com.eduplanner.ed_ms_administracion.filter;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.eduplanner.ed_ms_administracion.service.JwtValidatorService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

/**
 * Valida el JWT en cada petición protegida de este microservicio.
 */
@Component
@RequiredArgsConstructor
@Log4j2
public class JwtValidationFilter extends OncePerRequestFilter {

    private final JwtValidatorService jwtValidatorService;

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

        try {
            if (jwtValidatorService.isTokenValid(token)) {
                request.setAttribute("email", jwtValidatorService.extractEmail(token));
                request.setAttribute("idUser", jwtValidatorService.extractIdUser(token));
                request.setAttribute("idRole", jwtValidatorService.extractIdRole(token));
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
        return false;
    }


    private boolean esRutaSoloAdministrador(String method, String uri) {
        if (!uri.contains("/docentes")) return false;
        return method.equalsIgnoreCase("POST") ||
               method.equalsIgnoreCase("PUT")  ||
               method.equalsIgnoreCase("DELETE");
    }

    private void sendError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"mensaje\": \"" + message + "\"}");
    }
}