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

    @PutMapping("/{id}/student-count")
    public ResponseEntity<Void> adjustStudentCount(
            @PathVariable Integer id,
            @RequestParam int delta) {

        System.out.println(">>> INTERNAL COURSE CONTROLLER");
        System.out.println(">>> COURSE ID: " + id);
        System.out.println(">>> DELTA: " + delta);

        return repository.findById(id).map(course -> {

            System.out.println(">>> CURSO ENCONTRADO");
            System.out.println(">>> COUNT ANTERIOR: " + course.getStudentCount());

            short newCount = (short) Math.max(
                    0,
                    course.getStudentCount() + delta
            );

            course.setStudentCount(newCount);

            repository.save(course);

            System.out.println(">>> COUNT NUEVO: " + newCount);

            return ResponseEntity.ok().<Void>build();

        }).orElseGet(() -> {
            System.out.println(">>> CURSO NO ENCONTRADO: " + id);
            return ResponseEntity.notFound().build();
        });
    }
}