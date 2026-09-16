package com.eduplanner.ed_ms_administracion.controller;

import com.eduplanner.ed_lib_common.entity.User;
import com.eduplanner.ed_ms_administracion.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.dto.UserInfoDTO;
import com.eduplanner.ed_lib_common.dto.UserResponseDTO
;
/**
 * Endpoints internos: solo deben ser llamados por otros microservicios, 
 * en este caso por gestion academica y por notas
 */
@RestController
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
     * Datos básicos de un usuario (nombre, correo, rol) para uso interno de
     * otros microservicios, por ejemplo ed_ms_notas para armar reportes y
     * notificaciones de notas definitivas (RF 9.5).
     */
    @GetMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<UserInfoDTO>> getUserInfo(@PathVariable Integer id) {
        return userRepository.findById(id)
                .map(user -> {
                    UserInfoDTO dto = new UserInfoDTO();
                    dto.setIdUser(user.getIdUser());
                    dto.setName(user.getName());
                    dto.setSurnames(user.getSurnames());
                    dto.setEmail(user.getEmail());
                    dto.setRoleName(user.getRole().getName());
                    dto.setIdRole(user.getRole().getIdRole());
                    dto.setStatus(user.getStatus());

                    HttpGlobalResponse<UserInfoDTO> response = new HttpGlobalResponse<>();
                    response.setData(dto);
                    response.setMessage("Usuario encontrado");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * lista de estudiantes de un curso
     */
    @GetMapping("/course/{idCourse}")
    public ResponseEntity<List<UserResponseDTO>> getUsersByCourse(@PathVariable Integer idCourse) {
        List<UserResponseDTO> users = userRepository.findByIdCourse(idCourse).stream()
                .map(UserResponseDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(users);
    }
}