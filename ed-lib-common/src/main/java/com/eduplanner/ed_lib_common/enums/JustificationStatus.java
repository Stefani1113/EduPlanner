package com.eduplanner.ed_lib_common.enums;

/**
 * Estado del proceso de justificación de una inasistencia.
 * Debe coincidir exactamente con el ENUM de la columna justification_status en la tabla attendance.
 *
 * NONE     -> no se ha ingresado ninguna justificación
 * PENDING  -> el estudiante/acudiente ingresó una justificación, falta revisión
 * APPROVED -> un directivo/docente aprobó la justificación
 * REJECTED -> un directivo/docente rechazó la justificación
 */
public enum JustificationStatus {
    NONE,
    PENDING,
    APPROVED,
    REJECTED
}
