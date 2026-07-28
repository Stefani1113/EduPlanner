package com.eduplanner.ed_ms_administracion.controller;

import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.dto.UpdateRoleDTO;
import com.eduplanner.ed_lib_common.dto.UpdateStaffDTO;
import com.eduplanner.ed_lib_common.dto.UpdateStatusDTO;
import com.eduplanner.ed_lib_common.dto.UpdateStudentDTO;
import com.eduplanner.ed_lib_common.dto.UserResponseDTO;
import com.eduplanner.ed_lib_common.enums.RolEnum;
import com.eduplanner.ed_ms_administracion.config.RestTemplateConfig;
import com.eduplanner.ed_ms_administracion.security.RequireRole;
import com.eduplanner.ed_ms_administracion.service.UserEditService;
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
    private final UserEditService userEditService;

    // Consultar todos los usuarios
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


    // GET /users/search?name=Juan
    //Consultar usuario por nombre
    @RequireRole(RolEnum.ADMINISTRADOR)
    @GetMapping("/search")
    public ResponseEntity<HttpGlobalResponse<List<UserResponseDTO>>> getUserByName(@RequestParam String name) {
        HttpGlobalResponse<List<UserResponseDTO>> response = new HttpGlobalResponse<>();
            List<UserResponseDTO> users = userQueryService.findByName(name);
            response.setData(users);
            response.setMessage(users.isEmpty()
                    ? "No se encontraron usuarios con ese nombre"
                    : "Usuarios encontrador por nombre");
            return ResponseEntity.ok(response);
    }

    // Consultar usuario por Id
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

    //Editar estudiantes
    @PutMapping("/{id}/student")
    public ResponseEntity<HttpGlobalResponse<Void>> updateStudent(
            @PathVariable Integer id, @RequestBody UpdateStudentDTO dto) {
        return handleUpdate(() -> userEditService.updateStudent(id, dto));
    }


    //Editar staff (administrador / directivo)
    @PutMapping("/{id}/staff")
    public ResponseEntity<HttpGlobalResponse<Void>> updateStaff(
            @PathVariable Integer id, @RequestBody UpdateStaffDTO dto) {
        return handleUpdate(() -> userEditService.updateStaff(id, dto));
    }

    //Editar rol
    @PutMapping("/{id}/role")
    public ResponseEntity<HttpGlobalResponse<Void>> updateRole(
            @PathVariable Integer id, @RequestBody UpdateRoleDTO dto) {
        return handleUpdate(() -> userEditService.updateRole(id, dto));
    }

    //Editar stado
    @PatchMapping("/{id}/status")
    public ResponseEntity<HttpGlobalResponse<Void>> updateStatus(
            @PathVariable Integer id, @RequestBody UpdateStatusDTO dto) {
        return handleUpdate(() -> userEditService.updateStatus(id, dto));
    }

    /**
     * Envuelve la ejecución de cada update para no repetir el mismo
     */
    private ResponseEntity<HttpGlobalResponse<Void>> handleUpdate(Runnable action) {
        HttpGlobalResponse<Void> response = new HttpGlobalResponse<>();
        try {
            action.run();
            response.setMessage("Usuario actualizado correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (IllegalStateException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
    }
}