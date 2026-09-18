package com.EduPlanner.ed_ms_gestion_academica.repository;
import com.eduplanner.ed_lib_common.entity.AcademicLoad;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface AcademicLoadRepository extends JpaRepository<AcademicLoad, Integer> {
    boolean existsByIdTeacherAndIdCourseAndIdSubject(Integer idTeacher, Integer idCourse, Integer idSubject);
    List<AcademicLoad> findByStatusTrue();
    List<AcademicLoad> findByIdTeacherAndStatusTrue(Integer idTeacher);
    List<AcademicLoad> findByIdCourseAndStatusTrue(Integer idCourse);
    List<AcademicLoad> findByIdSubjectAndStatusTrue(Integer idSubject);
    List<AcademicLoad> findAllByIdAcademicLoadIn(List<Integer> ids);
    
}

