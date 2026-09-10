package com.EduPlanner.ed_ms_gestion_academica.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "ed-ms-administracion")
public interface AdministracionServiceClient {

    /**
     * Devuelve el nombre del rol del usuario, o null si no existe.
     */
    @GetMapping("/eduplanner/internal/users/{idUser}/role")
    String getUserRole(@PathVariable("idUser") Integer idUser);
}
