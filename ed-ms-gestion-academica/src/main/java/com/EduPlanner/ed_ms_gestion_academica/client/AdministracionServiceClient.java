package com.EduPlanner.ed_ms_gestion_academica.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.eduplanner.ed_lib_common.dto.UserResponseDTO;

@FeignClient(name = "ed-ms-administracion")
public interface AdministracionServiceClient {

    /**
     * Devuelve el nombre del rol del usuario, o null si no existe.
     * @param idUser
     * @return
     */
    @GetMapping("/eduplanner/internal/users/{idUser}/role")
    String getUserRole(@PathVariable("idUser") Integer idUser);

    /**
     *Devuelve usuarios de dicho curso
     * @param idCourse
     * @return
     */
    @GetMapping("/eduplanner/internal/user/courses/{idCourse}")
    List<UserResponseDTO> getUsersByCourse(@PathVariable("idCourse") Integer idCourse);
}
