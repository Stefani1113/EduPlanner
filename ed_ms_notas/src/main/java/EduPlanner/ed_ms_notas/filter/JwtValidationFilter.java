package eduPlanner.ed_ms_notas.filter;

import eduPlanner.ed_ms_notas.service.JwtValidatorService;
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
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        String auth = req.getHeader("Authorization");

        if (auth == null || !auth.startsWith("Bearer ")) {
            sendError(res, 401, "Se requiere el encabezado Authorization");
            return;
        }

        String token = auth.substring(7);
        boolean valid;
        try {
            valid = jwtValidatorService.isTokenValid(token);
        } catch (Exception e) {
            log.error("JWT filter error", e);
            sendError(res, 401, "Error de autenticación");
            return;
        }

        if (!valid) {
            sendError(res, 401, "Token inválido o expirado");
            return;
        }

        req.setAttribute("idUser", jwtValidatorService.extractIdUser(token));
        req.setAttribute("role", jwtValidatorService.extractRole(token));

        // A partir de aquí, cualquier excepción (de negocio, de base de datos, etc.)
        // sale como el error real y no se disfraza de 401.
        chain.doFilter(req, res);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getRequestURI().contains("/internal/");
    }

    private void sendError(HttpServletResponse res, int status, String msg) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json");
        res.getWriter().write("{\"message\":\"" + msg + "\"}");
    }
}
