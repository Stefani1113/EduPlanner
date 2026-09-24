package com.EduPlanner.ed_ms_gestion_academica.controller;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.EduPlanner.ed_ms_gestion_academica.service.CourseService;
import com.eduplanner.ed_lib_common.dto.CourseRequestDTO;
import com.eduplanner.ed_lib_common.dto.CourseResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/** RF 8.1.1 - Base: /eduplanner/courses */
@RestController @RequestMapping("/courses") @RequiredArgsConstructor
public class CourseController {
    private final CourseService service;

    @PostMapping
    public ResponseEntity<HttpGlobalResponse<CourseResponseDTO>> registerCourse(@Valid @RequestBody CourseRequestDTO req) {
        HttpGlobalResponse<CourseResponseDTO> r = new HttpGlobalResponse<>();
        try { r.setData(service.registerCourse(req)); r.setMessage("Curso registrado correctamente"); return ResponseEntity.status(HttpStatus.CREATED).body(r); }
        catch (IllegalArgumentException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.CONFLICT).body(r); }
        catch (DataIntegrityViolationException e) { throw e; }
        catch (Exception e) { r.setMessage("Error registrando curso"); return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(r); }
    }

    @PutMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<CourseResponseDTO>> updateCourse(@PathVariable Integer id, @Valid @RequestBody CourseRequestDTO req) {
        HttpGlobalResponse<CourseResponseDTO> r = new HttpGlobalResponse<>();
        try { r.setData(service.updateCourse(id, req)); r.setMessage("Curso actualizado correctamente"); return ResponseEntity.ok(r); }
        catch (IllegalArgumentException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.CONFLICT).body(r); }
        catch (DataIntegrityViolationException e) { throw e; }
        catch (RuntimeException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r); }
    }

    @GetMapping
    public ResponseEntity<HttpGlobalResponse<Page<CourseResponseDTO>>> listCourses(Pageable pageable) {
        HttpGlobalResponse<Page<CourseResponseDTO>> r = new HttpGlobalResponse<>();
        r.setData(service.listCourses(pageable)); r.setMessage("Cursos consultado correctamente"); return ResponseEntity.ok(r);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<CourseResponseDTO>> getCourseById(@PathVariable Integer id) {
        HttpGlobalResponse<CourseResponseDTO> r = new HttpGlobalResponse<>();
        try { r.setData(service.getCourseById(id)); r.setMessage("Curso encontrado"); return ResponseEntity.ok(r); }
        catch (DataIntegrityViolationException e) { throw e; }
        catch (RuntimeException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r); }
    }

    @GetMapping("/filter")
    public ResponseEntity<HttpGlobalResponse<Page<CourseResponseDTO>>> filterCourses(
            @RequestParam(required = false) Integer period,
            @RequestParam(required = false) Integer level,
            @RequestParam(required = false) Integer shift,
            Pageable pageable) {

        HttpGlobalResponse<Page<CourseResponseDTO>> r =
                new HttpGlobalResponse<>();

        Page<CourseResponseDTO> data;

        if (period != null) {

            data = service.getCoursesByPeriod(
                    period,
                    pageable
            );

        } else if (level != null) {

            data = service.getCoursesByLevel(
                    level,
                    pageable
            );

        } else if (shift != null) {

            data = service.getCoursesByShift(
                    shift,
                    pageable
            );

        } else {

            data = service.listCourses(pageable);
        }

        r.setData(data);

        r.setMessage(
                data.isEmpty()
                        ? "No se encontraron cursos con ese filtro"
                        : "Cursos filtrados correctamente"
        );

        return data.isEmpty()
                ? ResponseEntity.status(HttpStatus.NOT_FOUND).body(r)
                : ResponseEntity.ok(r);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<Void>> deleteCourse(@PathVariable Integer id) {
        HttpGlobalResponse<Void> r = new HttpGlobalResponse<>();
        try { service.deleteCourse(id); r.setMessage("Curso eliminado correctamente"); return ResponseEntity.ok(r); }
        catch (DataIntegrityViolationException e) { throw e; }
        catch (RuntimeException e) { r.setMessage(e.getMessage()); return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r); }
    }
}