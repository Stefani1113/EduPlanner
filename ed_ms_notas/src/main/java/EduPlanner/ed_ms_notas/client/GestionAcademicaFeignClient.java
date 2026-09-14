package eduPlanner.ed_ms_notas.client;

import com.eduplanner.ed_lib_common.dto.AcademicPeriodResponseDTO;
import com.eduplanner.ed_lib_common.dto.CourseResponseDTO;
import com.eduplanner.ed_lib_common.dto.SubjectResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Cliente Feign declarativo hacia ed-ms-gestion-academica.
 * Reemplaza las llamadas manuales por RestTemplate por una interfaz de Feign.
 */
@FeignClient(name = "gestion-academica-service", url = "${services.gestion-academica.base-url}")
public interface GestionAcademicaFeignClient {

    @GetMapping("/internal/courses/{idCourse}/exists")
    Boolean courseExists(@PathVariable("idCourse") Integer idCourse);

    @GetMapping("/internal/subjects/{idSubject}/exists")
    Boolean subjectExists(@PathVariable("idSubject") Integer idSubject);

    @GetMapping("/internal/academic-periods/{idPeriod}/exists")
    Boolean academicPeriodExists(@PathVariable("idPeriod") Integer idPeriod);

    /** Curso completo (incluye name). 404 si no existe. */
    @GetMapping("/internal/courses/{idCourse}")
    CourseResponseDTO getCourse(@PathVariable("idCourse") Integer idCourse);

    /** Asignatura completa (incluye name). 404 si no existe. */
    @GetMapping("/internal/subjects/{idSubject}")
    SubjectResponseDTO getSubject(@PathVariable("idSubject") Integer idSubject);

    /** Periodo académico completo (incluye name). 404 si no existe. */
    @GetMapping("/internal/academic-periods/{idPeriod}")
    AcademicPeriodResponseDTO getAcademicPeriod(@PathVariable("idPeriod") Integer idPeriod);
}
