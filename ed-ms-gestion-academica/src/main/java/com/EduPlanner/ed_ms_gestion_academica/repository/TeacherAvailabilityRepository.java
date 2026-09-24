package com.EduPlanner.ed_ms_gestion_academica.repository;

import com.eduplanner.ed_lib_common.entity.TeacherAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


import java.util.List;

public interface TeacherAvailabilityRepository extends JpaRepository<TeacherAvailability, Integer> {
    boolean existsByIdTeacherAndDayOfWeekAndIdTimeSlot(Integer idTeacher, Short dayOfWeek, Integer idTimeSlot);
    List<TeacherAvailability> findByIdTeacher(Integer idTeacher);
    Page<TeacherAvailability> findByIdTeacher(Integer idTeacher, Pageable pageable);
}