package com.EduPlanner.ed_ms_gestion_academica.repository;
import com.eduplanner.ed_lib_common.entity.AcademicTeacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface AcademicTeacherRepository extends JpaRepository<AcademicTeacher, Integer> {
    boolean existsByIdUser(Integer idUser);
    List<AcademicTeacher> findByStatusTrue();
}
