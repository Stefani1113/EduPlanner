package com.eduplanner.ed_lib_common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Respuesta de una nota mostrando nombres en lugar de ids.
 * Los nombres de estudiante/docente/curso/asignatura/periodo se obtienen
 * vía Feign de ed-ms-administracion y ed-ms-gestion-academica.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradeDetailResponseDTO {

    private Integer idGrade;
    private String studentName;
    private String teacherName;
    private String courseName;
    private String subjectName;
    private String periodName;
    private String evaluativeActivityName;
    private String evaluationTypeName;
    private BigDecimal gradeValue;
    private String status;
    private LocalDate registrationDate;
}
