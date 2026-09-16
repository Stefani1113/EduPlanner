package com.EduPlanner.ed_ms_gestion_academica.repository;
import com.eduplanner.ed_lib_common.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Integer> {
    boolean existsByName(String name);
    List<Subject> findByStatusTrue();
    List<Subject> findByNameContainingIgnoreCaseAndStatusTrue(String name);
}
