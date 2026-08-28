package com.EduPlanner.ed_ms_gestion_academica.controller;

import com.eduplanner.ed_lib_common.dto.AcademicLevelRequestDTO;
import com.eduplanner.ed_lib_common.dto.AcademicLevelResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.enums.RolEnum;
import com.EduPlanner.ed_ms_gestion_academica.security.RequireRole;
import com.EduPlanner.ed_ms_gestion_academica.service.AcademicLevelService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/academic-levels")
@RequiredArgsConstructor
public class AcademicLevelController {

    private final AcademicLevelService service;

    /**
     * Listar Niveles - listar activos
     * academic-levels - Todos
     * academic-levels?active=true - Solo activos
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @GetMapping
    public ResponseEntity<HttpGlobalResponse<List<AcademicLevelResponseDTO>>> getAll(
        @RequestParam(required = false) Boolean active) {
        HttpGlobalResponse<List<AcademicLevelResponseDTO>> response = new HttpGlobalResponse<>();
        List<AcademicLevelResponseDTO> result = (Boolean.TRUE.equals(active)) ? service.findAllActive() : service.findAll();
        response.setData(result);
        response.setMessage("Niveles académicos consultados correctamente");
        return ResponseEntity.ok(response);
    }

    /**
     * Buscar por Id
     * @param id
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @GetMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<AcademicLevelResponseDTO>> getById(@PathVariable Integer id) {
        HttpGlobalResponse<AcademicLevelResponseDTO> response = new HttpGlobalResponse<>();
        try {
            response.setData(service.findById(id));
            response.setMessage("Nivel académico encontrado");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Crear nivel
     * @param dto
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @PostMapping
    public ResponseEntity<HttpGlobalResponse<AcademicLevelResponseDTO>> create(@Valid @RequestBody AcademicLevelRequestDTO dto) {
        HttpGlobalResponse<AcademicLevelResponseDTO> response = new HttpGlobalResponse<>();
        try {
            response.setData(service.create(dto));
            response.setMessage("Nivel académico creado correctamente");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
    }


    /**
     * Editar nivel
     * @param id
     * @param dto
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @PutMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<AcademicLevelResponseDTO>> update(
            @PathVariable Integer id, @Valid @RequestBody AcademicLevelRequestDTO dto) {
        HttpGlobalResponse<AcademicLevelResponseDTO> response = new HttpGlobalResponse<>();
        try {
            response.setData(service.update(id, dto));
            response.setMessage("Nivel académico actualizado correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Desactivar / Eliminar nivel
     * @param id
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<Void>> deactivate(@PathVariable Integer id) {
        HttpGlobalResponse<Void> response = new HttpGlobalResponse<>();
        try {
            service.deactivate(id);
            response.setMessage("Nivel académico desactivado correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}