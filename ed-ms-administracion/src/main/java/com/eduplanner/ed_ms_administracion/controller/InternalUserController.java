package com.eduplanner.ed_ms_administracion.controller;

import com.eduplanner.ed_lib_common.entity.User;
import com.eduplanner.ed_ms_administracion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints internos: solo deben ser llamados por otros microservicios, 
 * en este caso por gestion academica
 */

@RequestMapping("/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserRepository userRepository;

    /**
     * Busca usuario por Id
     * @param id
     * @return
     */
    @GetMapping("/{id}/role")
    public ResponseEntity<String> getUserRole(@PathVariable Integer id) {
        return userRepository.findById(id)
                .map(User::getRole)
                .map(role -> ResponseEntity.ok(role.getName()))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Devuelve el nombre completo (nombre + apellidos) de un usuario.
     * Usado por gestion-academica para mostrar nombres en vez de ids
     * (por ejemplo, en el historial y PDF de asistencia).
     */
    @GetMapping("/{id}/full-name")
    public ResponseEntity<String> getUserFullName(@PathVariable Integer id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(user.getName() + " " + user.getSurnames()))
                .orElse(ResponseEntity.notFound().build());
    }
}