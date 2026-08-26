package com.eduplanner.ed_lib_common.enums;

/**
 * Estados posibles de un registro de asistencia.
 * Debe coincidir exactamente con el ENUM de la columna attendance_status en la tabla attendance.
 */
public enum AttendanceStatus {
    PRESENT,
    ABSENT,
    LATE,
    EARLY_DEPARTURE,
    JUSTIFIED
}
