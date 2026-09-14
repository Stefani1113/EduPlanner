package com.EduPlanner.ed_ms_gestion_academica.repository;

import com.eduplanner.ed_lib_common.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleRepository
        extends JpaRepository<Schedule, Integer> {
}