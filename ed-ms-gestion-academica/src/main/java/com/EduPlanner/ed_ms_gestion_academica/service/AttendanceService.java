package com.EduPlanner.ed_ms_gestion_academica.service;

import com.eduplanner.ed_lib_common.dto.AttendanceRequestDTO;
import com.eduplanner.ed_lib_common.dto.AttendanceResponseDTO;
import com.eduplanner.ed_lib_common.entity.Attendance;
import com.EduPlanner.ed_ms_gestion_academica.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

/** HU 4.2 - Registrar tardanzas y salidas anticipadas (y asistencia en general) */
@Service
@RequiredArgsConstructor
@Log4j2
public class AttendanceService {

    private final AttendanceRepository repository;

    public AttendanceResponseDTO registerAttendance(AttendanceRequestDTO req) {
        if (repository.existsByIdScheduleAndIdStudentAndAttendanceDate(
                req.getIdSchedule(), req.getIdStudent(), req.getAttendanceDate())) {
            throw new IllegalArgumentException(
                    "Ya existe un registro de asistencia para este estudiante, horario y fecha");
        }
        Attendance a = new Attendance();
        map(req, a);
        return toResponse(repository.save(a));
    }

    public AttendanceResponseDTO updateAttendance(Integer id, AttendanceRequestDTO req) {
        Attendance a = getOrThrow(id);
        map(req, a);
        return toResponse(repository.save(a));
    }

    public AttendanceResponseDTO getAttendanceById(Integer id) {
        return toResponse(getOrThrow(id));
    }

    private Attendance getOrThrow(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro de asistencia no encontrado: " + id));
    }

    private void map(AttendanceRequestDTO r, Attendance a) {
        a.setIdSchedule(r.getIdSchedule());
        a.setIdStudent(r.getIdStudent());
        a.setAttendanceDate(r.getAttendanceDate());
        a.setAttendanceStatus(r.getAttendanceStatus());
        a.setObservation(r.getObservation());
    }

    private AttendanceResponseDTO toResponse(Attendance a) {
        AttendanceResponseDTO r = new AttendanceResponseDTO();
        r.setIdAttendance(a.getIdAttendance());
        r.setIdSchedule(a.getIdSchedule());
        r.setIdStudent(a.getIdStudent());
        r.setAttendanceDate(a.getAttendanceDate());
        r.setAttendanceStatus(a.getAttendanceStatus());
        r.setObservation(a.getObservation());
        r.setJustificationText(a.getJustificationText());
        r.setJustificationStatus(a.getJustificationStatus());
        r.setReviewedBy(a.getReviewedBy());
        r.setReviewedAt(a.getReviewedAt());
        r.setCreatedAt(a.getCreatedAt());
        r.setUpdatedAt(a.getUpdatedAt());
        return r;
    }
}
