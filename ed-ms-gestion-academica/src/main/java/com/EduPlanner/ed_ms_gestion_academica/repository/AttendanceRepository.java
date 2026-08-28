package com.EduPlanner.ed_ms_gestion_academica.repository;

import com.eduplanner.ed_lib_common.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {

    boolean existsByIdScheduleAndIdStudentAndAttendanceDate(Integer idSchedule, Integer idStudent, LocalDate attendanceDate);

    Optional<Attendance> findByIdScheduleAndIdStudentAndAttendanceDate(Integer idSchedule, Integer idStudent, LocalDate attendanceDate);

    /** Historial de un estudiante en un periodo */
    List<Attendance> findByIdStudentAndAttendanceDateBetweenOrderByAttendanceDateAsc(
            Integer idStudent, LocalDate startDate, LocalDate endDate);

    /** Historial de un curso/grupo en un periodo */
    List<Attendance> findByIdCourseAndAttendanceDateBetweenOrderByAttendanceDateAsc(
            Integer idCourse, LocalDate startDate, LocalDate endDate);
}
