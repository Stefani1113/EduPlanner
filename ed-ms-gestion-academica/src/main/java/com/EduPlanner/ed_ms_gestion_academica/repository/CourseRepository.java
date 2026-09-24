package com.EduPlanner.ed_ms_gestion_academica.repository;
import com.eduplanner.ed_lib_common.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CourseRepository extends JpaRepository<Course, Integer> {
    boolean existsByNameAndIdPeriod(String name, Integer idPeriod);
    List<Course> findByStatusTrue();
    List<Course> findByIdPeriodAndStatusTrue(Integer idPeriod);
    List<Course> findByIdLevelAndStatusTrue(Integer idLevel);
    List<Course> findByIdShiftAndStatusTrue(Integer idShift);
    Page<Course> findByStatusTrue(Pageable pageable);
    Page<Course> findByIdPeriodAndStatusTrue(Integer idPeriod, Pageable pageable);
    Page<Course> findByIdLevelAndStatusTrue(Integer idLevel, Pageable pageable);
    Page<Course> findByIdShiftAndStatusTrue(Integer idShift, Pageable pageable);
}