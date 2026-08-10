package com.EduPlanner.ed_ms_gestion_academica.controller;

import com.eduplanner.ed_lib_common.dto.CourseRequestDTO;
import com.eduplanner.ed_lib_common.dto.CourseResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.EduPlanner.ed_ms_gestion_academica.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/** RF 8.1.1 - Base: /eduplanner/courses */
@RestController @RequestMapping("/courses") @RequiredArgsConstructor
public class CourseController {
    private final CourseService service;

    @PostMapping
    public ResponseEntity<HttpGlobalResponse<CourseResponseDTO>> registerCourse(@Valid @RequestBody CourseRequestDTO req) {
        HttpGlobalResponse<CourseResponseDTO> r = new HttpGlobalResponse<>();
        try { r.setData(service.registerCourse(req)); r.setMessage("Curso registrado con éxito"); return ResponseEntity.status(HttpStatus.CREATED).body(r); }
        catch (IllegalArgumentException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.CONFLICT).body(r); }
        catch (Exception e) { r.setMessage("Error registrando curso"); return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(r); }
    }

    @PutMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<CourseResponseDTO>> updateCourse(@PathVariable Integer id, @Valid @RequestBody CourseRequestDTO req) {
        HttpGlobalResponse<CourseResponseDTO> r = new HttpGlobalResponse<>();
        try { r.setData(service.updateCourse(id, req)); r.setMessage("Curso actualizado con éxito"); return ResponseEntity.ok(r); }
        catch (IllegalArgumentException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.CONFLICT).body(r); }
        catch (RuntimeException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r); }
    }

    @GetMapping
    public ResponseEntity<HttpGlobalResponse<List<CourseResponseDTO>>> listCourses() {
        HttpGlobalResponse<List<CourseResponseDTO>> r = new HttpGlobalResponse<>();
        r.setData(service.listCourses()); r.setMessage("Cursos recuperados con éxito"); return ResponseEntity.ok(r);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<CourseResponseDTO>> getCourseById(@PathVariable Integer id) {
        HttpGlobalResponse<CourseResponseDTO> r = new HttpGlobalResponse<>();
        try { r.setData(service.getCourseById(id)); r.setMessage("Curso encontrado"); return ResponseEntity.ok(r); }
        catch (RuntimeException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r); }
    }

    @GetMapping("/filter")
    public ResponseEntity<HttpGlobalResponse<List<CourseResponseDTO>>> filterCourses(
            @RequestParam(required = false) Integer period,
            @RequestParam(required = false) Integer level,
            @RequestParam(required = false) Integer shift) {
        HttpGlobalResponse<List<CourseResponseDTO>> r = new HttpGlobalResponse<>();
        List<CourseResponseDTO> data;
        if (period != null) data = service.getCoursesByPeriod(period);
        else if (level != null) data = service.getCoursesByLevel(level);
        else if (shift != null) data = service.getCoursesByShift(shift);
        else data = service.listCourses();
        r.setData(data); r.setMessage(data.isEmpty() ? "No se encontraron cursos" : "Cursos filtrados con éxito");
        return data.isEmpty() ? ResponseEntity.status(HttpStatus.NOT_FOUND).body(r) : ResponseEntity.ok(r);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<Void>> deleteCourse(@PathVariable Integer id) {
        HttpGlobalResponse<Void> r = new HttpGlobalResponse<>();
        try { service.deleteCourse(id); r.setMessage("Curso eliminado con éxito"); return ResponseEntity.ok(r); }
        catch (RuntimeException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r); }
    }
}
