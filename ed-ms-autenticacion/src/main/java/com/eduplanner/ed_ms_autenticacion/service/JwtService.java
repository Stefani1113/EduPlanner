package com.eduplanner.ed_ms_autenticacion.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.eduplanner.ed_lib_common.enums.RolEnum;

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
    private Integer tokenExpiration;

    private SecretKey getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(int idUser, int idRole) {
        String roleName = RolEnum.fromId(idRole).name(); 
        return Jwts.builder()
                .claims(Map.of("role", roleName))
                .subject(String.valueOf(idUser))
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

    public Integer extractIdUser(String token) {
        return extractClaim(token, c -> Integer.valueOf(c.getSubject()));
    }

    public String extractIdRole(String token) {
        return extractClaim(token, c -> c.get("role", String.class));
    }

    public String refreshToken(String token) throws Exception {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSignKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String roleName = claims.get("role", String.class);
            Integer idRole = RolEnum.valueOf(roleName).getId();

            return generateToken(
                    Integer.parseInt(claims.getSubject()),
                    idRole
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

    /**
     * Genera un token de activación de cuenta
     */
    public String generateAccountActivationToken(String email) {
        return Jwts.builder()
                .subject(email)
                .claim("type", "account-activation")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000L)) // 24 Horas
                .signWith(getSignKey())
                .compact();
    }

    /**
     * Valida el token de activación y devuelve el correo del usuario
     */
    public String validateAccountActivationToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSignKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            
            String type = claims.get("type", String.class);
            if (!"account-activation".equals(type)) {
                throw new RuntimeException("Tipo de token invalido");
            }

            return claims.getSubject();

        } catch (ExpiredJwtException e) {
            throw new RuntimeException("El enlace de expiración expiró");
        } catch (JwtException e) {
            throw new RuntimeException("Token de activavión inválido");
        }
    }
}