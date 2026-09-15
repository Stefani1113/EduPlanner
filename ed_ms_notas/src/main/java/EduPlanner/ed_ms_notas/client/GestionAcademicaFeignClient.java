package EduPlanner.ed_ms_notas.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Comunicación con ed-ms-gestion-academica vía Feign.
 * "name" debe coincidir EXACTO con spring.application.name de gestion-academica en Consul.
 */
@FeignClient(name = "ed-ms-gestion-academica")
public interface GestionAcademicaFeignClient {

    @GetMapping("/eduplanner/internal/courses/{id}/name")
    String getCourseName(@PathVariable("id") Integer id);

    @GetMapping("/eduplanner/internal/subjects/{id}/name")
    String getSubjectName(@PathVariable("id") Integer id);

    @GetMapping("/eduplanner/internal/periods/{id}/name")
    String getPeriodName(@PathVariable("id") Integer id);
}
