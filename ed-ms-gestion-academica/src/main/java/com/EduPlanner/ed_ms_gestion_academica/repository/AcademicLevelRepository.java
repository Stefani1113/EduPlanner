package com.EduPlanner.ed_ms_gestion_academica.repository;

import com.eduplanner.ed_lib_common.entity.AcademicLevel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AcademicLevelRepository extends JpaRepository<AcademicLevel, Integer> {
    boolean existsByName(String name);
}