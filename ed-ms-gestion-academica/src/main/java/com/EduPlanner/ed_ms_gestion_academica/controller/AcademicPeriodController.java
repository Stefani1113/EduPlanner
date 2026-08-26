package com.EduPlanner.ed_ms_gestion_academica.controller;

import com.EduPlanner.ed_ms_gestion_academica.service.AcademicPeriodService;
import com.EduPlanner.ed_ms_gestion_academica.security.RequireRole;
import com.eduplanner.ed_lib_common.dto.AcademicPeriodRequestDTO;
import com.eduplanner.ed_lib_common.dto.AcademicPeriodResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.enums.RolEnum;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/academic-periods")
@RequiredArgsConstructor
public class AcademicPeriodController {

    private final AcademicPeriodService service;

    /**
     * Listar todos
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @GetMapping
    public ResponseEntity<HttpGlobalResponse<List<AcademicPeriodResponseDTO>>> getAll() {
        HttpGlobalResponse<List<AcademicPeriodResponseDTO>> response = new HttpGlobalResponse<>();
        response.setData(service.findAll());
        response.setMessage("Periodos académicos consultados correctamente");
        return ResponseEntity.ok(response);
    }

    /**
     * Buscar por Id
     * @param id
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @GetMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<AcademicPeriodResponseDTO>> getById(@PathVariable Integer id) {
        HttpGlobalResponse<AcademicPeriodResponseDTO> response = new HttpGlobalResponse<>();
        try {
            response.setData(service.findById(id));
            response.setMessage("Periodo académico encontrado");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Crear periodo
     * @param dto
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @PostMapping
    public ResponseEntity<HttpGlobalResponse<AcademicPeriodResponseDTO>> create(@Valid @RequestBody AcademicPeriodRequestDTO dto) {
        HttpGlobalResponse<AcademicPeriodResponseDTO> response = new HttpGlobalResponse<>();
        try {
            response.setData(service.create(dto));
            response.setMessage("Periodo académico creado correctamente");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
    }

    /**
     * Actualizar periodo
     * @param id
     * @param dto
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @PutMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<AcademicPeriodResponseDTO>> update(
            @PathVariable Integer id, @Valid @RequestBody AcademicPeriodRequestDTO dto) {
        HttpGlobalResponse<AcademicPeriodResponseDTO> response = new HttpGlobalResponse<>();
        try {
            response.setData(service.update(id, dto));
            response.setMessage("Periodo académico actualizado correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Desactivar / Eliminar periodo
     * @param id
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<Void>> deactivate(@PathVariable Integer id) {
        HttpGlobalResponse<Void> response = new HttpGlobalResponse<>();
        try {
            service.deactivate(id);
            response.setMessage("Periodo académico desactivado correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}