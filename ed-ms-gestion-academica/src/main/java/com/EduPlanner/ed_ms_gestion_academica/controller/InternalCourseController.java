package com.EduPlanner.ed_ms_gestion_academica.controller;

import com.EduPlanner.ed_ms_gestion_academica.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints internos: solo deben ser llamados por otros microservicios
 */
@RestController
@RequestMapping("/internal/courses")
@RequiredArgsConstructor
public class InternalCourseController {

    private final CourseRepository repository;

    /**
     * Ajusta el contador de estudiantes de un curso.
     * delta=1 al asignar un estudiante, delta=-1 al quitarlo/cambiarlo de curso.
     */
    @PatchMapping("/{id}/student-count")
    public ResponseEntity<Void> adjustStudentCount(
            @PathVariable Integer id, @RequestParam int delta) {

        return repository.findById(id).map(course -> {
            short newCount = (short) Math.max(0, course.getStudentCount() + delta);
            course.setStudentCount(newCount);
            repository.save(course);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}