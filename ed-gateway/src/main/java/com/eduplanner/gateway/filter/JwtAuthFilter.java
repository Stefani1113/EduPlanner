package com.eduplanner.gateway.filter;

import com.eduplanner.gateway.config.GatewayConfig;
import com.eduplanner.gateway.config.JwtUtil;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;

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
    }
}