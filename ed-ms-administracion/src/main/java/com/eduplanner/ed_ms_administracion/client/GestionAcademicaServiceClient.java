package com.eduplanner.ed_ms_administracion.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "ed-ms-gestion-academica")
public interface GestionAcademicaServiceClient {

    @PutMapping("/eduplanner/internal/courses/{idCourse}/student-count")
    void adjustCourseStudentCount(
            @PathVariable("idCourse") Integer idCourse,
            @RequestParam("delta") int delta
    );
}