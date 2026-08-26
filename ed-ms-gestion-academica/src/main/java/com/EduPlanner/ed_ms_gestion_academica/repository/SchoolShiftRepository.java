package com.EduPlanner.ed_ms_gestion_academica.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eduplanner.ed_lib_common.entity.SchoolShift;

public interface SchoolShiftRepository extends JpaRepository<SchoolShift, Integer> {
    boolean existsByName(String name);

}
