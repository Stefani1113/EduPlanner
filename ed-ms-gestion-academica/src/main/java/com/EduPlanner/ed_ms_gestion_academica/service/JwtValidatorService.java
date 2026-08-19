package com.EduPlanner.ed_ms_gestion_academica.service;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.function.Function;

@Service
public class JwtValidatorService {
    @Value("${security.jwt.secret-key}") private String secretKey;
    private SecretKey getSignKey() { return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey)); }
    public Boolean isTokenValid(String token) {
        try { Jwts.parser().verifyWith(getSignKey()).build().parseSignedClaims(token); return true; }
        catch (JwtException | IllegalArgumentException e) { return false; }
    }
    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(Jwts.parser().verifyWith(getSignKey()).build().parseSignedClaims(token).getPayload());
    }
    public String extractEmail(String token) { return extractClaim(token, Claims::getSubject); }
    public Integer extractIdRole(String token) { return extractClaim(token, c -> c.get("rolId", Integer.class)); }
    public Long extractIdUser(String token) { return extractClaim(token, c -> c.get("userId", Long.class)); }
}
