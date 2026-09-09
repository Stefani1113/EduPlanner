package eduPlanner.ed_ms_notas.repository;

import com.eduplanner.ed_lib_common.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GradeRepository extends JpaRepository<Grade, Integer> {

    List<Grade> findByIdStudentAndIdPeriod(Integer idStudent, Integer idPeriod);

    List<Grade> findByIdStudentAndIdSubjectAndIdPeriod(Integer idStudent, Integer idSubject, Integer idPeriod);

    List<Grade> findByIdCourseAndIdSubjectAndIdPeriod(Integer idCourse, Integer idSubject, Integer idPeriod);

    boolean existsByIdStudentAndIdSubjectAndIdEvaluativeAndIdEvaluationType(
            Integer idStudent, Integer idSubject, Integer idEvaluative, Integer idEvaluationType);
}
