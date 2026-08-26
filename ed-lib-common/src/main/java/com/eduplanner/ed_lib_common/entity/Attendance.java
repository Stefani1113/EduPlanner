package com.eduplanner.ed_lib_common.entity;

import com.eduplanner.ed_lib_common.enums.AttendanceStatus;
import com.eduplanner.ed_lib_common.enums.JustificationStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** HU 4.2 - Registro de asistencia (presente, ausente, tardanza, salida anticipada, justificado) */
@Entity
@Data
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_attendance")
    private Integer idAttendance;

    @Column(name = "id_schedule", nullable = false)
    private Integer idSchedule;

    @Column(name = "id_student", nullable = false)
    private Integer idStudent;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "attendance_status", nullable = false)
    private AttendanceStatus attendanceStatus;

    @Column(name = "observation")
    private String observation;

    @Column(name = "justification_text")
    private String justificationText;

    @Enumerated(EnumType.STRING)
    @Column(name = "justification_status", nullable = false)
    private JustificationStatus justificationStatus = JustificationStatus.NONE;

    @Column(name = "reviewed_by")
    private Integer reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() { createdAt = updatedAt = LocalDateTime.now(); }

    @PreUpdate
    public void preUpdate() { updatedAt = LocalDateTime.now(); }
}
