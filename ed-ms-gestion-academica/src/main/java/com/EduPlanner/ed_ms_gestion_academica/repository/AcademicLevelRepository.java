package com.EduPlanner.ed_ms_gestion_academica.repository;

import com.eduplanner.ed_lib_common.entity.AcademicLevel;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AcademicLevelRepository extends JpaRepository<AcademicLevel, Integer> {
    boolean existsByName(String name);
    List<AcademicLevel> findByStatusTrue();
    Page<AcademicLevel> findAll(Pageable pageable);
    Page<AcademicLevel> findByStatusTrue(Pageable pageable);
}