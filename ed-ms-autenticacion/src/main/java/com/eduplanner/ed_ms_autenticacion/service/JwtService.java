package com.eduplanner.ed_ms_autenticacion.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${security.jwt.secret-key}")
    private String secretKey;

    /** RF 1.6 - Expiración de 10 minutos */
    @Value("${security.jwt.token-expiration}")
    private Long tokenExpiration;

    private SecretKey getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(int idUser, int idRole, String email) {
        return Jwts.builder()
                .claims(Map.of("idUser", idUser, "idRole", idRole))
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + tokenExpiration))
                .signWith(getSignKey())
                .compact();
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

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Long extractIdUser(String token) {
        return extractClaim(token, c -> c.get("idUser", Long.class));
    }

    public Integer extractIdRole(String token) {
        return extractClaim(token, c -> c.get("idRole", Integer.class));
    }

    public String refreshToken(String token) throws Exception {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSignKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return generateToken(
                    claims.get("idUser", Integer.class),
                    claims.get("idRole", Integer.class),
                    claims.getSubject()
            );
        } catch (ExpiredJwtException e) {
            throw new Exception("Token expirado: " + e.getMessage());
        } catch (JwtException e) {
            throw new Exception("Token inválido: " + e.getMessage());
        }
    }

    /**
     * Generar token de reset de contraseña 
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
     * Validar token de reset y retornar el correo
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

}
