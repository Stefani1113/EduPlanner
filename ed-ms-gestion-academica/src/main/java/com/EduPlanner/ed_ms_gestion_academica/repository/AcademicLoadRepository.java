package com.EduPlanner.ed_ms_gestion_academica.repository;
import com.eduplanner.ed_lib_common.entity.AcademicLoad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface AcademicLoadRepository extends JpaRepository<AcademicLoad, Integer> {
    boolean existsByIdTeacherAndIdCourseAndIdSubject(Integer idTeacher, Integer idCourse, Integer idSubject);
    List<AcademicLoad> findByStatusTrue();
    List<AcademicLoad> findByIdTeacherAndStatusTrue(Integer idTeacher);
    List<AcademicLoad> findByIdCourseAndStatusTrue(Integer idCourse);
    List<AcademicLoad> findByIdSubjectAndStatusTrue(Integer idSubject);
}
