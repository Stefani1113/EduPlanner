package com.EduPlanner.ed_ms_gestion_academica.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class AdministracionServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.administracion.base-url}")
    private String administracionBaseUrl;

    /**
     * Devuelve el nombre del rol del usuario, o null si no existe.
     */
    public String getUserRole(Integer idUser) {
        try {
            return restTemplate.getForObject(
                    administracionBaseUrl + "/internal/users/" + idUser + "/role",
                    String.class
            );
        } catch (HttpClientErrorException.NotFound e) {
            return null;
        }
    }
}