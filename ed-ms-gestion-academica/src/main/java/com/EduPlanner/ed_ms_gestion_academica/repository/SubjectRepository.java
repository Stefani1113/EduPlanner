package com.EduPlanner.ed_ms_gestion_academica.repository;
import com.eduplanner.ed_lib_common.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface SubjectRepository extends JpaRepository<Subject, Integer> {
    boolean existsByName(String name);
    List<Subject> findByStatusTrue();
    List<Subject> findByNameContainingIgnoreCaseAndStatusTrue(String name);
}
