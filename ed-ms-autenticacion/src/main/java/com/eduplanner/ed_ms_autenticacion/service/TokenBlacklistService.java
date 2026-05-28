package eduplanner.ed_ms_autenticacion.service;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * RF 1.6 - Cierre de sesión: invalida tokens JWT en memoria.
 */
@Service
public class TokenBlacklistService {

    private final Set<String> blacklisted = Collections.synchronizedSet(new HashSet<>());

    public void blacklist(String token) {
        blacklisted.add(token);
    }

    public boolean isBlacklisted(String token) {
        return blacklisted.contains(token);
    }
}
