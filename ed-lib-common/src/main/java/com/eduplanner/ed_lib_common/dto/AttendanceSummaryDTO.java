package com.eduplanner.ed_lib_common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** Resumen personal de asistencia (estadísticas de un estudiante en un periodo) */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSummaryDTO {
    private Integer idStudent;
    private LocalDate startDate;
    private LocalDate endDate;
    private long totalRecords;
    private long presentCount;
    private long lateCount;
    private long earlyDepartureCount;
    private long justifiedAbsenceCount;
    private long unjustifiedAbsenceCount;
    private double attendancePercentage;
}
