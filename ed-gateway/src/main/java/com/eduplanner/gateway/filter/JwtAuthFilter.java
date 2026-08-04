package com.eduplanner.gateway.filter;

import com.eduplanner.gateway.config.GatewayConfig;
import com.eduplanner.gateway.config.JwtUtil;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.logging.Logger;
/**
 * Filtro global JWT del Gateway.
 */
@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private static final Logger log = Logger.getLogger(JwtAuthFilter.class.getName());

    private final JwtUtil jwtUtil;
    private final GatewayConfig gatewayConfig;

    public JwtAuthFilter(JwtUtil jwtUtil, GatewayConfig gatewayConfig) {
        this.jwtUtil = jwtUtil;
        this.gatewayConfig = gatewayConfig;
    }

    @Override
    public int getOrder() {
        return -1;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

       // Rutas públicas: dejar pasar sin validar
        if (esRutaPublica(path)) {
            log.fine("Ruta pública, sin validación JWT: " + path);
            return chain.filter(exchange);
        }

 // Rutas protegidas: leer header Authorization
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warning("Petición sin token en ruta protegida: " + path);
            return responderError(exchange, HttpStatus.UNAUTHORIZED,
                    "Header Authorization es requerido (Bearer <token>)");
        }

        String token = authHeader.substring(7);

            //  Validar JWT
         if (!jwtUtil.isTokenValid(token)) {
            log.warning("Token inválido o expirado para ruta: " + path);
            return responderError(exchange, HttpStatus.UNAUTHORIZED,
                    "Token inválido o expirado. Por favor inicia sesión nuevamente.");
        }

        //Token válido: extraer claims e inyectarlos como headers 
         String email   = jwtUtil.extractUsername(token);
        Integer userId = jwtUtil.extractUserId(token);
        Integer rolId  = jwtUtil.extractRolId(token);

        log.fine("Token válido → userId=" + userId + " | rolId=" + rolId + " | ruta=" + path);

        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header("X-User-Id",    String.valueOf(userId))
                .header("X-User-Email", email)
                .header("X-User-Rol",   String.valueOf(rolId))
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    // Helpers

    private boolean esRutaPublica(String path) {
        if (gatewayConfig.getPublicPaths() == null) return false;
        return gatewayConfig.getPublicPaths().stream()
                .anyMatch(path::startsWith);
    }

    private Mono<Void> responderError(ServerWebExchange exchange, HttpStatus status, String mensaje) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String body = String.format("{\"error\": \"%s\"}", mensaje);
        DataBuffer buffer = response.bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));

        return response.writeWith(Mono.just(buffer));
    }
}

