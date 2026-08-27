package com.EduPlanner.ed_ms_gestion_academica.controller;

import com.eduplanner.ed_lib_common.dto.SubjectRequestDTO;
import com.eduplanner.ed_lib_common.dto.SubjectResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.EduPlanner.ed_ms_gestion_academica.service.SubjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/** Base: /eduplanner/subjects */
@RestController @RequestMapping("/subjects") @RequiredArgsConstructor
public class SubjectController {
    private final SubjectService service;

    @PostMapping
    public ResponseEntity<HttpGlobalResponse<SubjectResponseDTO>> registerSubject(@Valid @RequestBody SubjectRequestDTO req) {
        HttpGlobalResponse<SubjectResponseDTO> r = new HttpGlobalResponse<>();
        try { r.setData(service.registerSubject(req)); r.setMessage("Asignatura registrada correctamente"); return ResponseEntity.status(HttpStatus.CREATED).body(r); }
        catch (IllegalArgumentException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.CONFLICT).body(r); }
    }

    @PutMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<SubjectResponseDTO>> updateSubject(@PathVariable Integer id, @Valid @RequestBody SubjectRequestDTO req) {
        HttpGlobalResponse<SubjectResponseDTO> r = new HttpGlobalResponse<>();
        try { r.setData(service.updateSubject(id, req)); r.setMessage("Asignatura actualizada correctamente"); return ResponseEntity.ok(r); }
        catch (IllegalArgumentException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.CONFLICT).body(r); }
        catch (RuntimeException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r); }
    }

    @GetMapping
    public ResponseEntity<HttpGlobalResponse<List<SubjectResponseDTO>>> listSubjects() {
        HttpGlobalResponse<List<SubjectResponseDTO>> r = new HttpGlobalResponse<>();
        r.setData(service.listSubjects()); r.setMessage("Asignaturas recuperadas correctamente"); return ResponseEntity.ok(r);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<SubjectResponseDTO>> getSubjectById(@PathVariable Integer id) {
        HttpGlobalResponse<SubjectResponseDTO> r = new HttpGlobalResponse<>();
        try { r.setData(service.getSubjectById(id)); r.setMessage("Asignatura encontrada"); return ResponseEntity.ok(r); }
        catch (RuntimeException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r); }
    }

    @GetMapping("/search")
    public ResponseEntity<HttpGlobalResponse<List<SubjectResponseDTO>>> searchSubjects(@RequestParam String name) {
        HttpGlobalResponse<List<SubjectResponseDTO>> r = new HttpGlobalResponse<>();
        List<SubjectResponseDTO> data = service.searchSubjects(name);
        r.setData(data); r.setMessage(data.isEmpty() ? "No se encontraron asignaturas: " + name : "Búsqueda completada");
        return data.isEmpty() ? ResponseEntity.status(HttpStatus.NOT_FOUND).body(r) : ResponseEntity.ok(r);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<Void>> deleteSubject(@PathVariable Integer id) {
        HttpGlobalResponse<Void> r = new HttpGlobalResponse<>();
        try { service.deleteSubject(id); r.setMessage("Asignatura eliminada correctamente"); return ResponseEntity.ok(r); }
        catch (RuntimeException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r); }
    }
}
