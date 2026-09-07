package com.eduplanner.ed_ms_administracion.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Log4j2
public class GestionAcademicaServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.gestion-academica.base-url}")
    private String gestionAcademicaBaseUrl;

    /**
     * Suma o resta 1 al contador de estudiantes de un curso.
     * Si la llamada falla, solo se registra el error (no interrumpe
     * la operación principal de asignar el estudiante).
     */
    public void adjustCourseStudentCount(Integer idCourse, int delta) {
        if (idCourse == null) {
            return;
        }
        try {
            String url = gestionAcademicaBaseUrl + "/internal/courses/" + idCourse + "/student-count?delta=" + delta;
            restTemplate.exchange(url, HttpMethod.PATCH, null, Void.class);
        } catch (Exception e) {
            log.error("No se pudo sincronizar el contador de estudiantes del curso {}: {}", idCourse, e.getMessage());
        }
    }
}