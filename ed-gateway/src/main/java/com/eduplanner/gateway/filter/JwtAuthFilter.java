package com.eduplanner.gateway.filter;

import com.eduplanner.gateway.config.GatewayConfig;
import com.eduplanner.gateway.config.JwtUtil;

import reactor.core.publisher.Mono;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

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


        if (esRutaPublica(path)) {
            log.fine("Ruta pública, sin validación JWT: " + path);
            return chain.filter(exchange);
        }


        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warning("Petición sin token en ruta protegida: " + path);
            return responderError(exchange, HttpStatus.UNAUTHORIZED,
                    "Header Authorization es requerido (Bearer <token>)");
        }

        String token = authHeader.substring(7);


         if (!jwtUtil.isTokenValid(token)) {
            log.warning("Token inválido o expirado para ruta: " + path);
            return responderError(exchange, HttpStatus.UNAUTHORIZED,
                    "Token inválido o expirado. Por favor inicia sesión nuevamente.");
        }


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
    }
