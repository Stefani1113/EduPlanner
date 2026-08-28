package com.EduPlanner.ed_ms_gestion_academica.controller;

import com.eduplanner.ed_lib_common.dto.AttendanceRequestDTO;
import com.eduplanner.ed_lib_common.dto.AttendanceResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.dto.JustificationRequestDTO;
import com.eduplanner.ed_lib_common.dto.JustificationReviewDTO;
import com.EduPlanner.ed_ms_gestion_academica.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/** HU 4.2 - Registrar tardanzas y salidas anticipadas. Base: /eduplanner/attendance */
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
            r.setMessage("Asistencia registrada con éxito");
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
            r.setMessage("Asistencia actualizada con éxito");
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

    /**
     * HU 4.3 - Consultar historial de asistencia de un estudiante o de un curso/grupo
     * en un periodo determinado. Se debe mandar student O course, no ambos.
     * GET /eduplanner/attendance/history?student=15&startDate=2026-01-01&endDate=2026-06-30
     * GET /eduplanner/attendance/history?course=1&startDate=2026-01-01&endDate=2026-06-30
     */
    @GetMapping("/history")
    public ResponseEntity<HttpGlobalResponse<List<AttendanceResponseDTO>>> getHistory(
            @RequestParam(required = false) Integer student,
            @RequestParam(required = false) Integer course,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        HttpGlobalResponse<List<AttendanceResponseDTO>> r = new HttpGlobalResponse<>();
        try {
            List<AttendanceResponseDTO> data;
            if (student != null) {
                data = service.getHistoryByStudent(student, startDate, endDate);
            } else if (course != null) {
                data = service.getHistoryByCourse(course, startDate, endDate);
            } else {
                r.setMessage("Debes indicar el parámetro 'student' o el parámetro 'course'");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(r);
            }
            r.setData(data);
            r.setMessage(data.isEmpty() ? "No se encontraron registros de asistencia" : "Historial recuperado con éxito");
            return data.isEmpty() ? ResponseEntity.status(HttpStatus.NOT_FOUND).body(r) : ResponseEntity.ok(r);
        } catch (IllegalArgumentException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(r);
        }
    }

    /**
     * HU 4.4 - Paso 1: ingresar la justificación de una falta (ABSENT) ya registrada.
     * PATCH /eduplanner/attendance/{id}/justification
     */
    @PatchMapping("/{id}/justification")
    public ResponseEntity<HttpGlobalResponse<AttendanceResponseDTO>> submitJustification(
            @PathVariable Integer id, @Valid @RequestBody JustificationRequestDTO req) {
        HttpGlobalResponse<AttendanceResponseDTO> r = new HttpGlobalResponse<>();
        try {
            r.setData(service.submitJustification(id, req));
            r.setMessage("Justificación registrada, queda pendiente de revisión");
            return ResponseEntity.ok(r);
        } catch (IllegalArgumentException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(r);
        } catch (RuntimeException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r);
        }
    }

    /**
     * HU 4.4 - Paso 2: un directivo/docente aprueba o rechaza la justificación.
     * PATCH /eduplanner/attendance/{id}/justification/review
     */
    @PatchMapping("/{id}/justification/review")
    public ResponseEntity<HttpGlobalResponse<AttendanceResponseDTO>> reviewJustification(
            @PathVariable Integer id, @Valid @RequestBody JustificationReviewDTO req) {
        HttpGlobalResponse<AttendanceResponseDTO> r = new HttpGlobalResponse<>();
        try {
            r.setData(service.reviewJustification(id, req));
            r.setMessage(req.getApproved() ? "Justificación aprobada" : "Justificación rechazada");
            return ResponseEntity.ok(r);
        } catch (IllegalArgumentException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(r);
        } catch (RuntimeException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r);
        }
    }
}
