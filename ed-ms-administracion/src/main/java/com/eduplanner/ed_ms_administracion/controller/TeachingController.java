package com.eduplanner.ed_ms_administracion.controller;


import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.dto.TeachingRequestDTO;
import com.eduplanner.ed_lib_common.dto.TeachingResponseDTO;
import com.eduplanner.ed_lib_common.enums.RolEnum;
import com.eduplanner.ed_ms_administracion.security.RequireRole;
import com.eduplanner.ed_ms_administracion.service.TeachingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * RF 5 / RF 5.1 / RF 5.2 / RF 5.3 / RF 5.4 - Gestión de perfiles de docentes.
 * Todos los endpoints requieren JWT válido (validado en JwtValidationFilter).
 * POST, PUT, DELETE → solo ADMINISTRADOR.
 * GET               → cualquier rol autenticado.
 *
 * Base: /eduplanner/teacher
 */
@RestController
@RequestMapping("/teacher")
@RequiredArgsConstructor
public class TeachingController {

    private final TeachingService teachingService;


    /**
     * RF 5 - Crear perfil de docente.
     * Se hace vía POST /users/register/teacher (RegisterController),
     * que sigue el mismo flujo de activación por correo que estudiante/staff:
     * contraseña aleatoria, cuenta pendiente de activación, idInstitution fijo
     * por configuración y rol tomado de RolEnum.DOCENTE.getId().
     */

    /**
     * RF 5.1 - Editar perfil de docente.
     * PUT /eduplanner/teacher/{id}
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @PutMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<TeachingResponseDTO>> updateTeacher(
            @PathVariable Integer id,
            @Valid @RequestBody TeachingRequestDTO request) {
        HttpGlobalResponse<TeachingResponseDTO> response = new HttpGlobalResponse<>();
        try {
            TeachingResponseDTO data = teachingService.updateTeacher(id, request);
            response.setData(data);
            response.setMessage("Docente actualizado correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (RuntimeException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.setMessage("Error al actualizar el docente");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

   /**
     * RF 5.2 - Listar todos los docentes activos.
     * GET /eduplanner/teacher
     */
    @GetMapping
    public ResponseEntity<HttpGlobalResponse<List<TeachingResponseDTO>>> listTeachers() {
        HttpGlobalResponse<List<TeachingResponseDTO>> response = new HttpGlobalResponse<>();
        try {
            List<TeachingResponseDTO> data = teachingService.listTeachers();
            response.setData(data);
            response.setMessage("Docentes obtenidos correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.setMessage("Error al obtener docentes");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

   /**
     * RF 5.2 - Ver perfil de un docente por id.
     * GET /eduplanner/teacher/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<TeachingResponseDTO>> getTeacherById(@PathVariable Integer id) {
        HttpGlobalResponse<TeachingResponseDTO> response = new HttpGlobalResponse<>();
        try {
            TeachingResponseDTO data = teachingService.getTeacherById(id);
            response.setData(data);
            response.setMessage("Docente encontrado");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

     /**
     * RF 5.3 - Eliminar (borrado físico) perfil de docente.
     * DELETE /eduplanner/teacher/{id}
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<Void>> deleteTeacher(@PathVariable Integer id) {
        HttpGlobalResponse<Void> response = new HttpGlobalResponse<>();
        try {
            teachingService.deleteTeacher(id);
            response.setMessage("Docente eliminado correctamente");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * RF 5.4 - Buscar docentes por nombre, apellido, cargo o área profesional.
     * GET /eduplanner/teacher/search?q=matematicas
     */
    @GetMapping("/search")
    public ResponseEntity<HttpGlobalResponse<List<TeachingResponseDTO>>> searchTeachers(
            @RequestParam String q) {
        HttpGlobalResponse<List<TeachingResponseDTO>> response = new HttpGlobalResponse<>();
        try {
            List<TeachingResponseDTO> data = teachingService.searchTeachers(q);
            if (data.isEmpty()) {
                response.setMessage("No se encontraron docentes con el criterio: " + q);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            response.setData(data);
            response.setMessage("Búsqueda realizada correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.setMessage("Error al buscar docentes");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

     /**
     * RF 5.4 - Filtrar docentes por cargo/posición.
     * GET /eduplanner/teacher/filter?cargo=matematicas
     */
    @GetMapping("/filter")
    public ResponseEntity<HttpGlobalResponse<List<TeachingResponseDTO>>> filterByPosition(
            @RequestParam String position) {
        HttpGlobalResponse<List<TeachingResponseDTO>> response = new HttpGlobalResponse<>();
        try {
            List<TeachingResponseDTO> data = teachingService.filterByPosition(position);
            if (data.isEmpty()) {
                response.setMessage("No se encontraron docentes con el cargo: " + position);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            response.setData(data);
            response.setMessage("Filtro aplicado correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.setMessage("Error al filtrar docentes");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
