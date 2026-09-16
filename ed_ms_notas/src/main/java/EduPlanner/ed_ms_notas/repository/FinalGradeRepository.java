package EduPlanner.ed_ms_notas.repository;

import com.eduplanner.ed_lib_common.entity.FinalGrade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FinalGradeRepository extends JpaRepository<FinalGrade, Integer> {
    Optional<FinalGrade> findByIdStudentAndIdSubjectAndIdPeriod(Integer idStudent, Integer idSubject, Integer idPeriod);
    List<FinalGrade> findByIdSubjectAndIdPeriod(Integer idSubject, Integer idPeriod);
}
