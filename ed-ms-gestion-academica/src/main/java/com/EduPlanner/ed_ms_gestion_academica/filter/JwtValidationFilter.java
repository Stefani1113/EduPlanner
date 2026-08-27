package com.EduPlanner.ed_ms_gestion_academica.filter;

import com.EduPlanner.ed_ms_gestion_academica.service.JwtValidatorService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Log4j2
public class JwtValidationFilter extends OncePerRequestFilter {

    private final JwtValidatorService jwtValidatorService;

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain)
            throws ServletException, IOException {

        try {
            String auth = req.getHeader("Authorization");

            if (auth == null || !auth.startsWith("Bearer ")) {
                sendError(res, 401, "Se requiere el encabezado Authorization");
                return;
            }

            String token = auth.substring(7);

            if (!jwtValidatorService.isTokenValid(token)) {
                sendError(res, 401, "Token inválido o expirado");
                return;
            }

            req.setAttribute("idUser", jwtValidatorService.extractIdUser(token));
            req.setAttribute("role", jwtValidatorService.extractRole(token));

            chain.doFilter(req, res);

        } catch (Exception e) {
            log.error("JWT filter error", e);
            sendError(res, 401, "Error de autenticación");
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return false;
    }

    private void sendError(HttpServletResponse res, int status, String msg) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json");
        res.getWriter().write("{\"message\":\"" + msg + "\"}");
    }
}