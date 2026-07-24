package com.eduplanner.gateway.filter;

import java.util.logging.Logger;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;


@Component
public class LoggingFilter implements GlobalFilter, Ordered {

    private static final Logger log = Logger.getLogger(LoggingFilter.class.getName());

    @Override
    public int getOrder() {
        return -2;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        log.info(" Gateway " + request.getMethod()
                + " " + request.getURI().getPath()
                + " | IP: " + request.getRemoteAddress());

        long inicio = System.currentTimeMillis();

        return chain.filter(exchange).then(Mono.fromRunnable(() ->
        log.info(" Gateway " + request.getMethod()
                        + " " + request.getURI().getPath()
                        + " | Status: " + exchange.getResponse().getStatusCode()
                        + " | " + (System.currentTimeMillis() - inicio) + "ms")
        ));
    }
}
