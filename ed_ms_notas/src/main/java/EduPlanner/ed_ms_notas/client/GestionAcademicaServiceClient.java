package EduPlanner.ed_ms_notas.client;

import com.eduplanner.ed_lib_common.dto.AcademicPeriodResponseDTO;
import com.eduplanner.ed_lib_common.dto.CourseResponseDTO;
import com.eduplanner.ed_lib_common.dto.SubjectResponseDTO;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** Le pregunta a ed-ms-gestion-academica (vía Feign) si un curso, asignatura o periodo existe, y sus nombres. */
@Component
@RequiredArgsConstructor
public class GestionAcademicaServiceClient {

    private final GestionAcademicaFeignClient feignClient;

    public boolean courseExists(Integer idCourse) {
        return Boolean.TRUE.equals(feignClient.courseExists(idCourse));
    }

    public boolean subjectExists(Integer idSubject) {
        return Boolean.TRUE.equals(feignClient.subjectExists(idSubject));
    }

    public boolean academicPeriodExists(Integer idPeriod) {
        return Boolean.TRUE.equals(feignClient.academicPeriodExists(idPeriod));
    }

    /** Devuelve el nombre del curso, o null si no existe. */
    public String getCourseName(Integer idCourse) {
        try {
            CourseResponseDTO course = feignClient.getCourse(idCourse);
            return course != null ? course.getName() : null;
        } catch (FeignException.NotFound e) {
            return null;
        }
    }

    /** Devuelve el nombre de la asignatura, o null si no existe. */
    public String getSubjectName(Integer idSubject) {
        try {
            SubjectResponseDTO subject = feignClient.getSubject(idSubject);
            return subject != null ? subject.getName() : null;
        } catch (FeignException.NotFound e) {
            return null;
        }
    }

    /** Devuelve el nombre del periodo académico, o null si no existe. */
    public String getAcademicPeriodName(Integer idPeriod) {
        try {
            AcademicPeriodResponseDTO period = feignClient.getAcademicPeriod(idPeriod);
            return period != null ? period.getName() : null;
        } catch (FeignException.NotFound e) {
            return null;
        }
    }
}
