package com.EduPlanner.ed_ms_gestion_academica.controller;

import com.eduplanner.ed_lib_common.dto.SchoolShiftRequestDTO;
import com.eduplanner.ed_lib_common.dto.SchoolShiftResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.enums.RolEnum;
import com.EduPlanner.ed_ms_gestion_academica.security.RequireRole;
import com.EduPlanner.ed_ms_gestion_academica.service.SchoolShiftService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/school-shifts")
@RequiredArgsConstructor
public class SchoolShiftController {

    private final SchoolShiftService service;

    /**
     * Listar Jornadas
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @GetMapping
    public ResponseEntity<HttpGlobalResponse<List<SchoolShiftResponseDTO>>> getAll() {
        HttpGlobalResponse<List<SchoolShiftResponseDTO>> response = new HttpGlobalResponse<>();
        response.setData(service.findAll());
        response.setMessage("Jornadas consultadas correctamente");
        return ResponseEntity.ok(response);
    }

    /**
     * Traer jornada por Id
     * @param id
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @GetMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<SchoolShiftResponseDTO>> getById(@PathVariable Integer id) {
        HttpGlobalResponse<SchoolShiftResponseDTO> response = new HttpGlobalResponse<>();
        try {
            response.setData(service.findById(id));
            response.setMessage("Jornada encontrada");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    /**
     * Crear Jornada
     * @param dto
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @PostMapping
    public ResponseEntity<HttpGlobalResponse<SchoolShiftResponseDTO>> create(@Valid @RequestBody SchoolShiftRequestDTO dto) {
        HttpGlobalResponse<SchoolShiftResponseDTO> response = new HttpGlobalResponse<>();
        try {
            response.setData(service.create(dto));
            response.setMessage("Jornada creada correctamente");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
    }

    /**
     * Editar Jornada
     * @param id
     * @param dto
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @PutMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<SchoolShiftResponseDTO>> update(
            @PathVariable Integer id, @Valid @RequestBody SchoolShiftRequestDTO dto) {
        HttpGlobalResponse<SchoolShiftResponseDTO> response = new HttpGlobalResponse<>();
        try {
            response.setData(service.update(id, dto));
            response.setMessage("Jornada actualizada correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Desactivar Jornada
     * @param id
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<Void>> deactivate(@PathVariable Integer id) {
        HttpGlobalResponse<Void> response = new HttpGlobalResponse<>();
        try {
            service.deactivate(id);
            response.setMessage("Jornada desactivada correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}