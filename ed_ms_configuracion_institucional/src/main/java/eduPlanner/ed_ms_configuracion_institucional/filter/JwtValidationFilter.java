package eduPlanner.ed_ms_configuracion_institucional.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import eduPlanner.ed_ms_configuracion_institucional.service.JwtValidatorService;

import java.io.IOException;
import java.util.List;

/**
 * Valida el JWT en cada petición protegida de este microservicio.
 *
 * Excepción: las lecturas (GET) de la configuración institucional y del
 * carrusel son públicas a propósito. El nombre, logo, colores e imágenes
 * de la institución se usan para pintar el tema visual de TODA la app,
 * incluida la pantalla de login, donde todavía no existe un token.
 * Escribir (POST/PUT/DELETE) sigue exigiendo token + rol ADMINISTRADOR
 * (ver RoleInterceptor / @RequireRole).
 */
@Component
@RequiredArgsConstructor
@Log4j2
public class JwtValidationFilter extends OncePerRequestFilter {

    private final JwtValidatorService jwtValidatorService;

    private static final List<String> PUBLIC_GET_PATHS = List.of(
            "/eduplanner/configuration",
            "/eduplanner/configuration/carousel"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws IOException, ServletException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Header Authorization ausente o inválido");
            return;
        }

        String token = authHeader.substring(7);

        try {
            if (!jwtValidatorService.isTokenValid(token)) {
                sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Token inválido o expirado");
                return;
            }
            request.setAttribute("idUser", jwtValidatorService.extractIdUser(token));
            request.setAttribute("role", jwtValidatorService.extractRole(token));
        } catch (Exception e) {
            log.error("Error validando token: {}", e.getMessage());
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Error de validación del token");
            return;
        }
        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        if (path.equals("/eduplanner/actuator/health")) {
            return true;
        }

        boolean isGet = HttpMethod.GET.matches(request.getMethod());
        return isGet && PUBLIC_GET_PATHS.contains(path);
    }

    private void sendError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"mensaje\": \"" + message + "\"}");
    }
}
