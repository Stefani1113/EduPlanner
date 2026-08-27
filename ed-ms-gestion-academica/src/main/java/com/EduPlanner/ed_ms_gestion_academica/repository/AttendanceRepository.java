package com.EduPlanner.ed_ms_gestion_academica.repository;

import com.eduplanner.ed_lib_common.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {

    boolean existsByIdScheduleAndIdStudentAndAttendanceDate(Integer idSchedule, Integer idStudent, LocalDate attendanceDate);

    Optional<Attendance> findByIdScheduleAndIdStudentAndAttendanceDate(Integer idSchedule, Integer idStudent, LocalDate attendanceDate);
}
