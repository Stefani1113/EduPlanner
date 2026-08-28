package com.EduPlanner.ed_ms_gestion_academica.controller;

import com.eduplanner.ed_lib_common.dto.AttendanceRequestDTO;
import com.eduplanner.ed_lib_common.dto.AttendanceResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.EduPlanner.ed_ms_gestion_academica.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** HU 4.2 - Registrar tardanzas y salidas anticipadas 
 * endpoints /eduplanner/attendance */
@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService service;

    @PostMapping
    public ResponseEntity<HttpGlobalResponse<AttendanceResponseDTO>> registerAttendance(
            @Valid @RequestBody AttendanceRequestDTO req) {
        HttpGlobalResponse<AttendanceResponseDTO> r = new HttpGlobalResponse<>();
        try {
            r.setData(service.registerAttendance(req));
            r.setMessage("Asistencia registrada conrrectamente ");
            return ResponseEntity.status(HttpStatus.CREATED).body(r);
        } catch (IllegalArgumentException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(r);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<AttendanceResponseDTO>> updateAttendance(
            @PathVariable Integer id, @Valid @RequestBody AttendanceRequestDTO req) {
        HttpGlobalResponse<AttendanceResponseDTO> r = new HttpGlobalResponse<>();
        try {
            r.setData(service.updateAttendance(id, req));
            r.setMessage("Asistencia actualizada correctamente ");
            return ResponseEntity.ok(r);
        } catch (RuntimeException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<AttendanceResponseDTO>> getAttendanceById(
            @PathVariable Integer id) {
        HttpGlobalResponse<AttendanceResponseDTO> r = new HttpGlobalResponse<>();
        try {
            r.setData(service.getAttendanceById(id));
            r.setMessage("Asistencia encontrada");
            return ResponseEntity.ok(r);
        } catch (RuntimeException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r);
        }
    }
}
