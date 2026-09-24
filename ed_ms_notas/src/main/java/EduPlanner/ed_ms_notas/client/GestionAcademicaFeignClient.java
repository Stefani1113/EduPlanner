package EduPlanner.ed_ms_notas.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.eduplanner.ed_lib_common.dto.AcademicPeriodResponseDTO;
import com.eduplanner.ed_lib_common.dto.CourseResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.dto.SubjectResponseDTO;

@FeignClient(name = "ed-ms-gestion-academica")
public interface GestionAcademicaFeignClient {

    @GetMapping("/eduplanner/courses/{id}")
    HttpGlobalResponse<CourseResponseDTO> getCourse(
            @PathVariable("id") Integer id);

    @GetMapping("/eduplanner/subjects/{id}")
    HttpGlobalResponse<SubjectResponseDTO> getSubject(
            @PathVariable("id") Integer id);

    @GetMapping("/eduplanner/academic-periods/{id}")
    HttpGlobalResponse<AcademicPeriodResponseDTO> getAcademicPeriod(
            @PathVariable("id") Integer id);
}