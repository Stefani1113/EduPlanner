package eduplanner.ed_ms_autenticacion.controller;

import com.eduplanner.ed_lib_comun.dto.ChangeStatusRequestDTO;
import com.eduplanner.ed_lib_comun.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_comun.dto.UpdateRolRequestDTO;
import com.eduplanner.ed_lib_comun.dto.UserResponseDTO;
import com.eduplanner.ed_lib_comun.enums.RolEnum;
import eduplanner.ed_ms_autenticacion.security.RequireRole;
import eduplanner.ed_ms_autenticacion.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UserController {

    private final UserService usuarioService;

    /**
     * RF 6.2 - GET /eduplanner/usuarios/
     * Lista todos los usuarios. Solo ADMINISTRADOR.
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @GetMapping("/")
    public ResponseEntity<List<UserResponseDTO>> listar() {
        return ResponseEntity.ok(usuarioService.listarUsuarios());
    }

    /**
     * RF 6.2 - GET /eduplanner/usuarios/{id}
     * Obtiene un usuario por ID. Solo ADMINISTRADOR.
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> obtenerPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(usuarioService.obtenerPorId(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * RF 6.2 - GET /eduplanner/usuarios/por-rol/{idRol}
     * Filtra usuarios por rol. Solo ADMINISTRADOR.
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @GetMapping("/por-rol/{idRol}")
    public ResponseEntity<List<UserResponseDTO>> listarPorRol(@PathVariable Integer idRol) {
        try {
            return ResponseEntity.ok(usuarioService.listarPorRol(idRol));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * RF 6.2 - PUT /eduplanner/usuarios/{id}/rol
     * Actualiza el rol de un usuario. Solo ADMINISTRADOR.
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @PutMapping("/{id}/rol")
    public ResponseEntity<HttpGlobalResponse<UserResponseDTO>> actualizarRol(
            @PathVariable Long id,
            @RequestBody UpdateRolRequestDTO request) {
        try {
            HttpGlobalResponse<UserResponseDTO> response = usuarioService.actualizarRol(id, request);
            if (response.getData() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            HttpGlobalResponse<UserResponseDTO> err = new HttpGlobalResponse<>();
            err.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }
    }

    /**
     * RF 6.2 - PATCH /eduplanner/usuarios/{id}/estado
     * Activa o desactiva un usuario. Solo ADMINISTRADOR.
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @PatchMapping("/{id}/estado")
    public ResponseEntity<HttpGlobalResponse<UserResponseDTO>> cambiarEstado(
        @PathVariable Long id,
        @RequestBody ChangeStatusRequestDTO request) {

    try {
        return ResponseEntity.ok(
            usuarioService.cambiarEstado(id, request.getEstado())
        );

    } catch (EntityNotFoundException e) {

        HttpGlobalResponse<UserResponseDTO> err = new HttpGlobalResponse<>();
        err.setMessage(e.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
    }
}

    /**
     * GET /eduplanner/usuarios/mi-perfil
     * Perfil del usuario autenticado (cualquier rol).
     */
    @RequireRole({RolEnum.ADMINISTRADOR, RolEnum.ESTUDIANTE, RolEnum.DOCENTE, RolEnum.SISTEMA})
    @GetMapping("/mi-perfil")
    public ResponseEntity<UserResponseDTO> miPerfil(HttpServletRequest request) {
        try {
            Long idUser = (long) request.getAttribute("idUser");
            return ResponseEntity.ok(usuarioService.obtenerPorId(idUser));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
