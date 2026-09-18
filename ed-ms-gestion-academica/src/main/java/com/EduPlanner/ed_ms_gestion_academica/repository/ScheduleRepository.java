package com.EduPlanner.ed_ms_gestion_academica.repository;

import com.eduplanner.ed_lib_common.entity.Schedule;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleRepository extends JpaRepository<Schedule, Integer> {
        List<Schedule> findByIdAcademicLoadInAndStatusTrue(List<Integer> idAcademicLoads);
        List<Schedule> findByIdScheduleGenerationAndStatusTrue(Integer idScheduleGeneration);
        List<Schedule> findByIdScheduleGenerationAndIdAcademicLoadInAndStatusTrue(Integer idScheduleGeneration,List<Integer> idAcademicLoads);
        void deleteByIdScheduleGeneration(Integer idScheduleGeneration);
}