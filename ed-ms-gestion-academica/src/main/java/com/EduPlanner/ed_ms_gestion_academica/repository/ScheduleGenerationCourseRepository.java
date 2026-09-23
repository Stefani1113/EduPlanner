package com.EduPlanner.ed_ms_gestion_academica.repository;

import com.eduplanner.ed_lib_common.entity.ScheduleGenerationCourse;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleGenerationCourseRepository extends JpaRepository<ScheduleGenerationCourse, Integer> {
    void deleteByIdScheduleGeneration(Integer idScheduleGeneration);
    List<ScheduleGenerationCourse> findByIdCourse(Integer idCourse);
}