package com.EduPlanner.ed_ms_gestion_academica.controller;

import com.eduplanner.ed_lib_common.dto.AcademicLoadRequestDTO;
import com.eduplanner.ed_lib_common.dto.AcademicLoadResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.EduPlanner.ed_ms_gestion_academica.service.AcademicLoadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/** RF 8.1.2 - Base: /eduplanner/academic-loads */
@RestController @RequestMapping("/academic-loads") @RequiredArgsConstructor
public class AcademicLoadController {
    private final AcademicLoadService service;

    @PostMapping
    public ResponseEntity<HttpGlobalResponse<AcademicLoadResponseDTO>> registerLoad(@Valid @RequestBody AcademicLoadRequestDTO req) {
        HttpGlobalResponse<AcademicLoadResponseDTO> r = new HttpGlobalResponse<>();
        try { r.setData(service.registerLoad(req)); r.setMessage("Carga académica registrada correctamente"); return ResponseEntity.status(HttpStatus.CREATED).body(r); }
        catch (IllegalArgumentException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.CONFLICT).body(r); }
    }

    @PutMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<AcademicLoadResponseDTO>> updateLoad(@PathVariable Integer id, @Valid @RequestBody AcademicLoadRequestDTO req) {
        HttpGlobalResponse<AcademicLoadResponseDTO> r = new HttpGlobalResponse<>();
        try { r.setData(service.updateLoad(id, req)); r.setMessage("Carga académica actualizada correctamente"); return ResponseEntity.ok(r); }
        catch (RuntimeException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r); }
    }

    @GetMapping
    public ResponseEntity<HttpGlobalResponse<List<AcademicLoadResponseDTO>>> listLoads() {
        HttpGlobalResponse<List<AcademicLoadResponseDTO>> r = new HttpGlobalResponse<>();
        r.setData(service.listLoads()); r.setMessage("Cargas académicas recuperadas correctamente"); return ResponseEntity.ok(r);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<AcademicLoadResponseDTO>> getLoadById(@PathVariable Integer id) {
        HttpGlobalResponse<AcademicLoadResponseDTO> r = new HttpGlobalResponse<>();
        try { r.setData(service.getLoadById(id)); r.setMessage("Lista académica encontrada"); return ResponseEntity.ok(r); }
        catch (RuntimeException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r); }
    }

    @GetMapping("/filter")
    public ResponseEntity<HttpGlobalResponse<List<AcademicLoadResponseDTO>>> filterLoads(
            @RequestParam(required = false) Integer teacher,
            @RequestParam(required = false) Integer course,
            @RequestParam(required = false) Integer subject) {
        HttpGlobalResponse<List<AcademicLoadResponseDTO>> r = new HttpGlobalResponse<>();
        List<AcademicLoadResponseDTO> data;
        if (teacher != null)      data = service.getLoadsByTeacher(teacher);
        else if (course != null)  data = service.getLoadsByCourse(course);
        else if (subject != null) data = service.getLoadsBySubject(subject);
        else                      data = service.listLoads();
        r.setData(data); r.setMessage(data.isEmpty() ? "No se encontraron cargas académicas" : "Cargas académicas filtradas correctamente");
        return data.isEmpty() ? ResponseEntity.status(HttpStatus.NOT_FOUND).body(r) : ResponseEntity.ok(r);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<Void>> deleteLoad(@PathVariable Integer id) {
        HttpGlobalResponse<Void> r = new HttpGlobalResponse<>();
        try { service.deleteLoad(id); r.setMessage("Carga académica eliminada correctamente"); return ResponseEntity.ok(r); }
        catch (RuntimeException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r); }
    }
}
