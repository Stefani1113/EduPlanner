package EduPlanner.ed_ms_notas.client;

import org.springframework.stereotype.Component;

import com.eduplanner.ed_lib_common.dto.AcademicPeriodResponseDTO;
import com.eduplanner.ed_lib_common.dto.CourseResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.dto.SubjectResponseDTO;

import feign.FeignException;
import lombok.RequiredArgsConstructor;

/**
 * Comunicación con ed-ms-gestion-academica mediante Feign.
 */
@Component
@RequiredArgsConstructor
public class GestionAcademicaServiceClient {

    private final GestionAcademicaFeignClient feignClient;

    /**
     * Verifica si existe un curso.
     */
    public boolean courseExists(Integer idCourse) {
        try {
            HttpGlobalResponse<CourseResponseDTO> response =
                    feignClient.getCourse(idCourse);

            return response != null && response.getData() != null;

        } catch (FeignException.NotFound e) {
            return false;
        }
    }

    /**
     * Verifica si existe una asignatura.
     */
    public boolean subjectExists(Integer idSubject) {
        try {
            HttpGlobalResponse<SubjectResponseDTO> response =
                    feignClient.getSubject(idSubject);

            return response != null && response.getData() != null;

        } catch (FeignException.NotFound e) {
            return false;
        }
    }

    /**
     * Verifica si existe un periodo académico.
     */
    public boolean academicPeriodExists(Integer idPeriod) {
        try {
            HttpGlobalResponse<AcademicPeriodResponseDTO> response =
                    feignClient.getAcademicPeriod(idPeriod);

            return response != null && response.getData() != null;

        } catch (FeignException.NotFound e) {
            return false;
        }
    }

    /**
     * Devuelve el nombre del curso.
     */
    public String getCourseName(Integer idCourse) {
        try {
            HttpGlobalResponse<CourseResponseDTO> response =
                    feignClient.getCourse(idCourse);

            if (response == null || response.getData() == null) {
                return null;
            }

            return response.getData().getName();

        } catch (FeignException.NotFound e) {
            return null;
        }
    }

    /**
     * Devuelve el nombre de la asignatura.
     */
    public String getSubjectName(Integer idSubject) {
        try {
            HttpGlobalResponse<SubjectResponseDTO> response =
                    feignClient.getSubject(idSubject);

            if (response == null || response.getData() == null) {
                return null;
            }

            return response.getData().getName();

        } catch (FeignException.NotFound e) {
            return null;
        }
    }

    /**
     * Devuelve el nombre del periodo académico.
     */
    public String getAcademicPeriodName(Integer idPeriod) {
        try {
            HttpGlobalResponse<AcademicPeriodResponseDTO> response =
                    feignClient.getAcademicPeriod(idPeriod);

            if (response == null || response.getData() == null) {
                return null;
            }

            return response.getData().getName();

        } catch (FeignException.NotFound e) {
            return null;
        }
    }
}