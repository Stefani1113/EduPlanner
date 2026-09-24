package com.EduPlanner.ed_ms_gestion_academica.repository;
import com.eduplanner.ed_lib_common.entity.AcademicTeacher;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AcademicTeacherRepository extends JpaRepository<AcademicTeacher, Integer> {
    boolean existsByIdUser(Integer idUser);
    List<AcademicTeacher> findByStatusTrue();
    Optional<AcademicTeacher> findByIdUser(Integer idUser);
    Page<AcademicTeacher> findByStatusTrue(Pageable pageable);
}
