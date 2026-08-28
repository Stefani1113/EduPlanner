package com.EduPlanner.ed_ms_gestion_academica.service;

import com.eduplanner.ed_lib_common.dto.AttendanceRequestDTO;
import com.eduplanner.ed_lib_common.dto.AttendanceResponseDTO;
import com.eduplanner.ed_lib_common.dto.JustificationRequestDTO;
import com.eduplanner.ed_lib_common.dto.JustificationReviewDTO;
import com.eduplanner.ed_lib_common.entity.Attendance;
import com.eduplanner.ed_lib_common.enums.AttendanceStatus;
import com.eduplanner.ed_lib_common.enums.JustificationStatus;
import com.EduPlanner.ed_ms_gestion_academica.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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

    /** HU 4.3 - Consultar historial de asistencia de un estudiante en un periodo */
    public List<AttendanceResponseDTO> getHistoryByStudent(Integer idStudent, LocalDate startDate, LocalDate endDate) {
        validateRange(startDate, endDate);
        return repository.findByIdStudentAndAttendanceDateBetweenOrderByAttendanceDateAsc(idStudent, startDate, endDate)
                .stream().map(this::toResponse).toList();
    }

    /** HU 4.3 - Consultar historial de asistencia de un curso/grupo en un periodo */
    public List<AttendanceResponseDTO> getHistoryByCourse(Integer idCourse, LocalDate startDate, LocalDate endDate) {
        validateRange(startDate, endDate);
        return repository.findByIdCourseAndAttendanceDateBetweenOrderByAttendanceDateAsc(idCourse, startDate, endDate)
                .stream().map(this::toResponse).toList();
    }

    private void validateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Debes indicar fecha inicial y fecha final");
        }
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("La fecha inicial no puede ser posterior a la fecha final");
        }
    }

    /** HU 4.4 - Paso 1: ingresar la justificación de una falta ya registrada */
    public AttendanceResponseDTO submitJustification(Integer id, JustificationRequestDTO req) {
        Attendance a = getOrThrow(id); 


        if (a.getAttendanceStatus() != AttendanceStatus.ABSENT
            && a.getAttendanceStatus() != AttendanceStatus.LATE
            && a.getAttendanceStatus() != AttendanceStatus.JUSTIFIED) {
                throw new IllegalArgumentException(
            "Solo se puede justificar un registro con estado AUSENTE, TARDE o JUSTIFICADO");
        }
        if (a.getJustificationStatus() == JustificationStatus.PENDING
                || a.getJustificationStatus() == JustificationStatus.APPROVED) {
            throw new IllegalArgumentException(
                    "Esta falta ya tiene una justificación " +
                            (a.getJustificationStatus() == JustificationStatus.PENDING ? "pendiente de revisión" : "aprobada"));
        }

        a.setJustificationText(req.getJustificationText());
        a.setJustificationStatus(JustificationStatus.PENDING);
        a.setReviewedBy(null);
        a.setReviewedAt(null);

        return toResponse(repository.save(a));
    }

    /** HU 4.4 - Paso 2: un directivo/docente aprueba o rechaza la justificación */
    public AttendanceResponseDTO reviewJustification(Integer id, JustificationReviewDTO req) {
        Attendance a = getOrThrow(id);

        if (a.getJustificationStatus() != JustificationStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Solo se pueden revisar justificaciones en estado PENDING");
        }

        a.setJustificationStatus(req.getApproved() ? JustificationStatus.APPROVED : JustificationStatus.REJECTED);
        a.setReviewedBy(req.getReviewedBy());
        a.setReviewedAt(LocalDateTime.now());

        if (req.getApproved()) {
            a.setAttendanceStatus(AttendanceStatus.JUSTIFIED);
        }

        return toResponse(repository.save(a));
    }

    private Attendance getOrThrow(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro de asistencia no encontrado: " + id));
    }

    private void map(AttendanceRequestDTO r, Attendance a) {
        a.setIdSchedule(r.getIdSchedule());
        a.setIdStudent(r.getIdStudent());
        a.setIdCourse(r.getIdCourse());
        a.setAttendanceDate(r.getAttendanceDate());
        a.setAttendanceStatus(r.getAttendanceStatus());
        a.setObservation(r.getObservation());
    }

    private AttendanceResponseDTO toResponse(Attendance a) {
        AttendanceResponseDTO r = new AttendanceResponseDTO();
        r.setIdAttendance(a.getIdAttendance());
        r.setIdSchedule(a.getIdSchedule());
        r.setIdStudent(a.getIdStudent());
        r.setIdCourse(a.getIdCourse());
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
