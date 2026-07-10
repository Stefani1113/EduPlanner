package com.eduplanner.ed_ms_autenticacion.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;

import javax.crypto.SecretKey;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    // Clave de firma, generada a partir del secreto en application.properties
    private SecretKey getSignKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Genera un token especial SOLO para el flujo de "olvidé mi contraseña"
     */
    public String generatePasswordResetToken(String email) {
        return Jwts.builder()
                .subject(email)
                .claim("type", "password-reset")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 15 * 60 * 1000L)) // 15 min
                .signWith(getSignKey())
                .compact();
    }

    /**
     * Valida el token de reset: revisa firma, expiración
     */
    public String validatePasswordResetToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSignKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String type = claims.get("type", String.class);
            if (!"password-reset".equals(type)) {
                throw new RuntimeException("Tipo de token inválido");
            }
            return claims.getSubject();

        } catch (ExpiredJwtException e) {
            throw new RuntimeException("El token expiró");
        } catch (JwtException e) {
            throw new RuntimeException("Token inválido");
        }
    }

    // Genera un token normal de sesión (no de reset), para probar /redireccion
    public String generarTokenSesionPrueba(Long idUser, int idRole, String email) {
        return Jwts.builder()
                .subject(email)
                .claim("idUser", idUser)
                .claim("idRole", idRole)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000)) // 1 hora
                .signWith(getSignKey())
                .compact();
    }
}