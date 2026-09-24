package com.eduplanner.gateway.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.eduplanner.ed_lib_common.enums.RolEnum;

import javax.crypto.SecretKey;
import java.util.function.Function;
import java.util.logging.Logger;

@Component
public class JwtUtil {

    private static final Logger log = Logger.getLogger(JwtUtil.class.getName());

    @Value("${security.jwt.secret-key}")
    private String secretKey;

    private SecretKey getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSignKey())
                    .build()
                    .parseSignedClaims(token);

            return true;

        } catch (JwtException e) {
            log.warning("Token inválido o expirado: " + e.getMessage());
            return false;

        } catch (Exception e) {
            log.severe("Error validando token: " + e.getMessage());
            return false;
        }
    }

    public <T> T extractClaim(
            String token,
            Function<Claims, T> resolver) {

        Claims claims = Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return resolver.apply(claims);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Integer extractUserId(String token) {
        return Integer.valueOf(
                extractClaim(token, Claims::getSubject)
        );
    }

    public Integer extractRolId(String token) {

        String roleName = extractClaim(
                token,
                claims -> claims.get("role", String.class)
        );

        return RolEnum.valueOf(roleName).getId();
    }
}