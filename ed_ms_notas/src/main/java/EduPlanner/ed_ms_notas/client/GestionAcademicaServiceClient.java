package eduPlanner.ed_ms_notas.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/** Le pregunta a ed-ms-gestion-academica si un curso, asignatura o periodo existe. */
@Component
@RequiredArgsConstructor
public class GestionAcademicaServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.gestion-academica.base-url}")
    private String gestionAcademicaBaseUrl;

    public boolean courseExists(Integer idCourse) {
        return Boolean.TRUE.equals(restTemplate.getForObject(
                gestionAcademicaBaseUrl + "/internal/courses/" + idCourse + "/exists", Boolean.class));
    }

    public boolean subjectExists(Integer idSubject) {
        return Boolean.TRUE.equals(restTemplate.getForObject(
                gestionAcademicaBaseUrl + "/internal/subjects/" + idSubject + "/exists", Boolean.class));
    }

    public boolean academicPeriodExists(Integer idPeriod) {
        return Boolean.TRUE.equals(restTemplate.getForObject(
                gestionAcademicaBaseUrl + "/internal/academic-periods/" + idPeriod + "/exists", Boolean.class));
    }
}
