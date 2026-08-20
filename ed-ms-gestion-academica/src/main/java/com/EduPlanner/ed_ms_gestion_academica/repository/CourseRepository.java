package com.EduPlanner.ed_ms_gestion_academica.repository;
import com.eduplanner.ed_lib_common.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {
    boolean existsByNameAndIdPeriod(String name, Integer idPeriod);
    List<Course> findByStatusTrue();
    List<Course> findByIdPeriodAndStatusTrue(Integer idPeriod);
    List<Course> findByIdLevelAndStatusTrue(Integer idLevel);
    List<Course> findByIdShiftAndStatusTrue(Integer idShift);
}
