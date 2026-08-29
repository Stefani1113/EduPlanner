package com.EduPlanner.ed_ms_gestion_academica.controller;

import com.eduplanner.ed_lib_common.dto.TimeSlotRequestDTO;
import com.eduplanner.ed_lib_common.dto.TimeSlotResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.enums.RolEnum;
import com.EduPlanner.ed_ms_gestion_academica.security.RequireRole;
import com.EduPlanner.ed_ms_gestion_academica.service.TimeSlotService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/time-slots")
@RequiredArgsConstructor
public class TimeSlotController {

    private final TimeSlotService service;

    // GET /time-slots            -> todos
    // GET /time-slots?idShift=2  -> filtrado por jornada
    @RequireRole(RolEnum.ADMINISTRADOR)
    @GetMapping
    public ResponseEntity<HttpGlobalResponse<List<TimeSlotResponseDTO>>> getAll(
            @RequestParam(required = false) Integer idShift) {
        HttpGlobalResponse<List<TimeSlotResponseDTO>> response = new HttpGlobalResponse<>();
        List<TimeSlotResponseDTO> result = (idShift != null) ? service.findByShift(idShift) : service.findAll();
        response.setData(result);
        response.setMessage("Bloques horarios consultados correctamente");
        return ResponseEntity.ok(response);
    }

    /**
     * Buscar por Id
     * @param id
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @GetMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<TimeSlotResponseDTO>> getById(@PathVariable Integer id) {
        HttpGlobalResponse<TimeSlotResponseDTO> response = new HttpGlobalResponse<>();
        try {
            response.setData(service.findById(id));
            response.setMessage("Bloque horario encontrado");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Crear Franja
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @PostMapping
    public ResponseEntity<HttpGlobalResponse<TimeSlotResponseDTO>> create(@Valid @RequestBody TimeSlotRequestDTO dto) {
        HttpGlobalResponse<TimeSlotResponseDTO> response = new HttpGlobalResponse<>();
        try {
            response.setData(service.create(dto));
            response.setMessage("Bloque horario creado correctamente");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
    }

    /**
     * Editar Franja
     * @param id
     * @param dto
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @PutMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<TimeSlotResponseDTO>> update(
            @PathVariable Integer id, @Valid @RequestBody TimeSlotRequestDTO dto) {
        HttpGlobalResponse<TimeSlotResponseDTO> response = new HttpGlobalResponse<>();
        try {
            response.setData(service.update(id, dto));
            response.setMessage("Bloque horario actualizado correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Desactivar Franja
     * @param id
     * @return
     */
    @RequireRole(RolEnum.ADMINISTRADOR)
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<Void>> deactivate(@PathVariable Integer id) {
        HttpGlobalResponse<Void> response = new HttpGlobalResponse<>();
        try {
            service.deactivate(id);
            response.setMessage("Bloque horario desactivado correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}