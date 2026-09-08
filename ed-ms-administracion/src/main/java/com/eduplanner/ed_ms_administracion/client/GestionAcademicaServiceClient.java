package com.eduplanner.ed_ms_administracion.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Log4j2
public class GestionAcademicaServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.gestion-academica.base-url}")
    private String gestionAcademicaBaseUrl;

    public void adjustCourseStudentCount(Integer idCourse, int delta) {

        if (idCourse == null) {
            log.warn("No se puede actualizar contador: idCourse es null");
            return;
        }

        String url = gestionAcademicaBaseUrl
                + "/eduplanner/internal/courses/"
                + idCourse
                + "/student-count?delta="
                + delta;

        log.info(">>> ENVIANDO PUT INTERNO: {}", url);

        try {

            ResponseEntity<Void> response = restTemplate.exchange(
                    url,
                    HttpMethod.PUT,
                    null,
                    Void.class
            );

            log.info(
                    ">>> RESPUESTA GESTION ACADEMICA: {}",
                    response.getStatusCode()
            );

        } catch (Exception e) {

            log.error(
                    ">>> ERROR ACTUALIZANDO CONTADOR DEL CURSO {}",
                    idCourse,
                    e
            );

            throw e;
        }
    }
}
