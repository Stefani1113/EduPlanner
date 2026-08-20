package com.EduPlanner.ed_ms_gestion_academica.controller;

import com.eduplanner.ed_lib_common.dto.AcademicTeacherRequestDTO;
import com.eduplanner.ed_lib_common.dto.AcademicTeacherResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.EduPlanner.ed_ms_gestion_academica.service.AcademicTeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/** RF 8.1 - Base: /eduplanner/academic-teachers */
@RestController @RequestMapping("/academic-teachers") @RequiredArgsConstructor
public class AcademicTeacherController {
    private final AcademicTeacherService service;

    @PostMapping
    public ResponseEntity<HttpGlobalResponse<AcademicTeacherResponseDTO>> registerTeacher(@Valid @RequestBody AcademicTeacherRequestDTO req) {
        HttpGlobalResponse<AcademicTeacherResponseDTO> r = new HttpGlobalResponse<>();
        try { r.setData(service.registerTeacher(req)); r.setMessage("Profesor académico registrado con éxito"); return ResponseEntity.status(HttpStatus.CREATED).body(r); }
        catch (IllegalArgumentException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.CONFLICT).body(r); }
        catch (Exception e) { r.setMessage("Error registrando profesor académico"); return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(r); }
    }

    @PutMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<AcademicTeacherResponseDTO>> updateTeacher(@PathVariable Integer id, @Valid @RequestBody AcademicTeacherRequestDTO req) {
        HttpGlobalResponse<AcademicTeacherResponseDTO> r = new HttpGlobalResponse<>();
        try { r.setData(service.updateTeacher(id, req)); r.setMessage("Profesor académico actualizado con éxito"); return ResponseEntity.ok(r); }
        catch (IllegalArgumentException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(r); }
        catch (RuntimeException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r); }
    }

    @GetMapping
    public ResponseEntity<HttpGlobalResponse<List<AcademicTeacherResponseDTO>>> listTeachers() {
        HttpGlobalResponse<List<AcademicTeacherResponseDTO>> r = new HttpGlobalResponse<>();
        r.setData(service.listTeachers()); r.setMessage("Profesores académicos recuperados con éxito"); return ResponseEntity.ok(r);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<AcademicTeacherResponseDTO>> getTeacherById(@PathVariable Integer id) {
        HttpGlobalResponse<AcademicTeacherResponseDTO> r = new HttpGlobalResponse<>();
        try { r.setData(service.getTeacherById(id)); r.setMessage("Profesor académico encontrado"); return ResponseEntity.ok(r); }
        catch (RuntimeException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<Void>> deleteTeacher(@PathVariable Integer id) {
        HttpGlobalResponse<Void> r = new HttpGlobalResponse<>();
        try { service.deleteTeacher(id); r.setMessage("Profesor académico eliminado con éxito"); return ResponseEntity.ok(r); }
        catch (RuntimeException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r); }
    }
}
