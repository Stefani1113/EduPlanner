package com.EduPlanner.ed_ms_gestion_academica.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.eduplanner.ed_lib_common.dto.UserResponseDTO;

@FeignClient(name = "ed-ms-administracion")
public interface AdministracionServiceClient {

    /**
     * Devuelve el nombre del rol del usuario.
     *
     * @param idUser ID del usuario
     * @return nombre del rol
     */
    @GetMapping("/eduplanner/internal/users/{idUser}/role")
    String getUserRole(@PathVariable("idUser") Integer idUser);

    /**
     * Devuelve los usuarios de un curso.
     *
     * @param idCourse ID del curso
     * @return lista de usuarios
     */
    @GetMapping("/eduplanner/internal/users/courses/{idCourse}")
    List<UserResponseDTO> getUsersByCourse(
            @PathVariable("idCourse") Integer idCourse
    );

    /**
     * Devuelve el nombre completo del usuario.
     *
     * @param idUser ID del usuario
     * @return nombre completo del usuario
     */
    @GetMapping("/eduplanner/internal/users/{idUser}/full-name")
    String getUserFullName(@PathVariable("idUser") Integer idUser);
    

    /**
     * Devuelve id del usuario con con curso
     */
    @GetMapping("/eduplanner/internal/users/{idUser}/course")
    Integer getUserCourse(
            @PathVariable("idUser") Integer idUser
    );
}