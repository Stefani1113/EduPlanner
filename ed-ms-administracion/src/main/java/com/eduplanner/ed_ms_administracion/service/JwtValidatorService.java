package com.eduplanner.ed_ms_administracion.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.function.Function;

/**
 * Versión de solo LECTURA/VALIDACIÓN del JWT.
 * No genera tokens (eso sigue siendo exclusivo de ed-ms-autenticacion),
 * solo verifica firma y extrae datos, para proteger los endpoints locales.
 */
@Service
public class JwtValidatorService {

    @Value("${security.jwt.secret-key}")
    private String secretKey;

    private SecretKey getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public Boolean isTokenValid(String token) {
        try {
            Jwts.parser().verifyWith(getSignKey()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return resolver.apply(claims);
    }

    public Long extractIdUser(String token) {
        return extractClaim(token, c -> Long.valueOf(c.getSubject()));
    }

    public String extractIdRole(String token) {
        return extractClaim(token, c -> c.get("role", String.class));
    }
}