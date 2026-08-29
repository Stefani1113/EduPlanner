package com.EduPlanner.ed_ms_gestion_academica.controller;

import com.eduplanner.ed_lib_common.dto.TeacherAvailabilityRequestDTO;
import com.eduplanner.ed_lib_common.dto.TeacherAvailabilityResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.enums.RolEnum;
import com.EduPlanner.ed_ms_gestion_academica.security.RequireRole;
import com.EduPlanner.ed_ms_gestion_academica.service.TeacherAvailabilityService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teacher-availability")
@RequiredArgsConstructor
public class TeacherAvailabilityController {

    private final TeacherAvailabilityService service;

    /**
     * Listar todos y por docentes
     * teacher-availability            -> todos
     * teacher-availability?idTeacher=5 -> filtrado por docente
     * @param idTeacher
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @GetMapping
    public ResponseEntity<HttpGlobalResponse<List<TeacherAvailabilityResponseDTO>>> getAll(
            @RequestParam(required = false) Integer idTeacher) {
        HttpGlobalResponse<List<TeacherAvailabilityResponseDTO>> response = new HttpGlobalResponse<>();
        List<TeacherAvailabilityResponseDTO> result = (idTeacher != null)
                ? service.findByTeacher(idTeacher)
                : service.findAll();
        response.setData(result);
        response.setMessage("Disponibilidad consultada correctamente");
        return ResponseEntity.ok(response);
    }

    /**
     * Buscar por Id
     * @param id
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @GetMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<TeacherAvailabilityResponseDTO>> getById(@PathVariable Integer id) {
        HttpGlobalResponse<TeacherAvailabilityResponseDTO> response = new HttpGlobalResponse<>();
        try {
            response.setData(service.findById(id));
            response.setMessage("Disponibilidad encontrada");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Crear Disponibilidad
     * @param dto
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @PostMapping
    public ResponseEntity<HttpGlobalResponse<TeacherAvailabilityResponseDTO>> create(
            @Valid @RequestBody TeacherAvailabilityRequestDTO dto) {
        HttpGlobalResponse<TeacherAvailabilityResponseDTO> response = new HttpGlobalResponse<>();
        try {
            response.setData(service.create(dto));
            response.setMessage("Disponibilidad registrada correctamente");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
    }

    /**
     * Editar Disponibilidad
     * @param id
     * @param dto
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @PutMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<TeacherAvailabilityResponseDTO>> update(
            @PathVariable Integer id, @Valid @RequestBody TeacherAvailabilityRequestDTO dto) {
        HttpGlobalResponse<TeacherAvailabilityResponseDTO> response = new HttpGlobalResponse<>();
        try {
            response.setData(service.update(id, dto));
            response.setMessage("Disponibilidad actualizada correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Eliminar Disponibilidad
     * @param id
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<Void>> delete(@PathVariable Integer id) {
        HttpGlobalResponse<Void> response = new HttpGlobalResponse<>();
        try {
            service.delete(id);
            response.setMessage("Disponibilidad eliminada correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}