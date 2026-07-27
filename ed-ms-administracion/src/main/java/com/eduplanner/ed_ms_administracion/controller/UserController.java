// ed-ms-administracion/src/main/java/com/eduplanner/ed_ms_administracion/controller/UserController.java
package com.eduplanner.ed_ms_administracion.controller;

import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.dto.UserResponseDTO;
import com.eduplanner.ed_lib_common.enums.RolEnum;
import com.eduplanner.ed_ms_administracion.security.RequireRole;
import com.eduplanner.ed_ms_administracion.service.UserQueryService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserQueryService userQueryService;

    @RequireRole(RolEnum.ADMINISTRADOR)
    @GetMapping
    public ResponseEntity<HttpGlobalResponse<List<UserResponseDTO>>> getUsers(
            @RequestParam(required = false) Integer idRole) {

        HttpGlobalResponse<List<UserResponseDTO>> response = new HttpGlobalResponse<>();

        List<UserResponseDTO> users = (idRole != null)
                ? userQueryService.findByRole(idRole)
                : userQueryService.findAll();

        response.setData(users);
        response.setMessage("Usuarios consultados correctamente");
        return ResponseEntity.ok(response);
    }


    @RequireRole(RolEnum.ADMINISTRADOR)
    @GetMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<UserResponseDTO>> getUserById(@PathVariable Integer id) {
        HttpGlobalResponse<UserResponseDTO> response = new HttpGlobalResponse<>();
        try {
            UserResponseDTO user = userQueryService.findById(id);
            response.setData(user);
            response.setMessage("Usuario encontrado");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}