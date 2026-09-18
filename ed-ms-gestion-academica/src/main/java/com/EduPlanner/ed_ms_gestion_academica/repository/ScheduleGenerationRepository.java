package com.EduPlanner.ed_ms_gestion_academica.repository;

import com.eduplanner.ed_lib_common.entity.ScheduleGeneration;
import com.eduplanner.ed_lib_common.entity.SchedulerGenerationStatus;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleGenerationRepository extends JpaRepository<ScheduleGeneration, Integer> {
        Optional<ScheduleGeneration> findFirstByStatusOrderByCreatedAtDesc(SchedulerGenerationStatus status);
}