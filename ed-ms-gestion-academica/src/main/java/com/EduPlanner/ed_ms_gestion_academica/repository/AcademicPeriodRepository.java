package com.EduPlanner.ed_ms_gestion_academica.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eduplanner.ed_lib_common.entity.AcademicPeriod;
import org.springframework.data.domain.Page;

import org.springframework.data.domain.Pageable;


public interface AcademicPeriodRepository extends JpaRepository<AcademicPeriod, Integer> {
    boolean existsByName(String name);
    List<AcademicPeriod> findByStatusTrue();
    Page<AcademicPeriod> findByStatusTrue(Pageable pageable);
}
