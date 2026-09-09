package com.EduPlanner.ed_ms_gestion_academica.service;

import com.eduplanner.ed_lib_common.dto.AttendanceRequestDTO;
import com.eduplanner.ed_lib_common.dto.AttendanceResponseDTO;
import com.eduplanner.ed_lib_common.dto.AttendanceSummaryDTO;
import com.eduplanner.ed_lib_common.dto.JustificationRequestDTO;
import com.eduplanner.ed_lib_common.dto.JustificationReviewDTO;
import com.eduplanner.ed_lib_common.entity.Attendance;
import com.eduplanner.ed_lib_common.enums.AttendanceStatus;
import com.eduplanner.ed_lib_common.enums.JustificationStatus;
import com.EduPlanner.ed_ms_gestion_academica.client.AdministracionServiceClient;
import com.EduPlanner.ed_ms_gestion_academica.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**Registrar tardanzas y salidas anticipadas (y asistencia en general) */
@Service
@RequiredArgsConstructor
@Log4j2
public class AttendanceService {

    private final AttendanceRepository repository;
    private final AdministracionServiceClient administracionServiceClient;

    public AttendanceResponseDTO registerAttendance(AttendanceRequestDTO req) {
        if (repository.existsByIdScheduleAndIdStudentAndAttendanceDate(
                req.getIdSchedule(), req.getIdStudent(), req.getAttendanceDate())) {
            throw new IllegalArgumentException(
                    "Ya existe un registro de asistencia para este estudiante, horario y fecha");
        }
        validateIsActiveStudent(req.getIdStudent());
        Attendance a = new Attendance();
        map(req, a);
        return toResponse(repository.save(a));
    }

    /** Confirma en ed-ms-administracion que el idStudent existe y tiene rol ESTUDIANTE */
    private void validateIsActiveStudent(Integer idStudent) {
        String role = administracionServiceClient.getUserRole(idStudent);
        if (role == null) {
            throw new IllegalArgumentException("El estudiante " + idStudent + " no existe en administración");
        }
        if (!"ESTUDIANTE".equals(role)) {
            throw new IllegalArgumentException("El usuario " + idStudent + " no tiene rol ESTUDIANTE");
        }
    }

    public AttendanceResponseDTO updateAttendance(Integer id, AttendanceRequestDTO req) {
        Attendance a = getOrThrow(id);
        map(req, a);
        return toResponse(repository.save(a));
    }

    public AttendanceResponseDTO getAttendanceById(Integer id) {
        return toResponse(getOrThrow(id));
    }

    /**Consultar historial de asistencia de un estudiante en un periodo */
    public List<AttendanceResponseDTO> getHistoryByStudent(Integer idStudent, LocalDate startDate, LocalDate endDate) {
        validateRange(startDate, endDate);
        return repository.findByIdStudentAndAttendanceDateBetweenOrderByAttendanceDateAsc(idStudent, startDate, endDate)
                .stream().map(this::toResponse).toList();
    }

    /**Consultar historial de asistencia de un curso/grupo en un periodo */
    public List<AttendanceResponseDTO> getHistoryByCourse(Integer idCourse, LocalDate startDate, LocalDate endDate) {
        validateRange(startDate, endDate);
        return repository.findByIdCourseAndAttendanceDateBetweenOrderByAttendanceDateAsc(idCourse, startDate, endDate)
                .stream().map(this::toResponse).toList();
    }

    /**Resumen/estadísticas de asistencia de un estudiante en un periodo */
    public AttendanceSummaryDTO getSummaryByStudent(Integer idStudent, LocalDate startDate, LocalDate endDate) {
        validateRange(startDate, endDate);
        List<Attendance> records = repository.findByIdStudentAndAttendanceDateBetweenOrderByAttendanceDateAsc(
                idStudent, startDate, endDate);

        long total = records.size();
        long present = records.stream().filter(a -> a.getAttendanceStatus() == AttendanceStatus.PRESENT).count();
        long late = records.stream().filter(a -> a.getAttendanceStatus() == AttendanceStatus.LATE).count();
        long earlyDeparture = records.stream().filter(a -> a.getAttendanceStatus() == AttendanceStatus.EARLY_DEPARTURE).count();
        long justified = records.stream().filter(a -> a.getAttendanceStatus() == AttendanceStatus.JUSTIFIED).count();
        long unjustifiedAbsence = records.stream().filter(a -> a.getAttendanceStatus() == AttendanceStatus.ABSENT).count();

        // Cuenta como "asistencia" todo lo que no sea una falta sin justificar
        double percentage = total == 0 ? 0.0 : ((total - unjustifiedAbsence) * 100.0) / total;

        return new AttendanceSummaryDTO(idStudent, startDate, endDate, total, present, late,
                earlyDeparture, justified, unjustifiedAbsence, Math.round(percentage * 100.0) / 100.0);
    }

    private void validateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Debes indicar fecha inicial y fecha final");
        }
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("La fecha inicial no puede ser posterior a la fecha final");
        }
    }

    /**Ingresar la justificación de una falta, tardanza o justificación ya registrada */
    public AttendanceResponseDTO submitJustification(Integer id, JustificationRequestDTO req) {
        Attendance a = getOrThrow(id);

        if (a.getAttendanceStatus() != AttendanceStatus.ABSENT
                && a.getAttendanceStatus() != AttendanceStatus.LATE
                && a.getAttendanceStatus() != AttendanceStatus.JUSTIFIED) {
            throw new IllegalArgumentException(
                    "Solo se puede justificar un registro con estado ABSENT, LATE o JUSTIFIED");
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

    /**Un directivo/docente aprueba o rechaza la justificación */
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
