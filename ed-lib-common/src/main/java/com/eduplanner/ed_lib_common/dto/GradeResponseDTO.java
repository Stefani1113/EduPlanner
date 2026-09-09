package com.eduplanner.ed_lib_common.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

@Data
public class GradeResponseDTO {
    private Integer idGrade;
    private Integer idStudent;
    private Integer idCourse;
    private Integer idTeacher;
    private Integer idPeriod;
    private Integer idSubject;
    private Integer idEvaluative;
    private Integer idEvaluationType;
    private BigDecimal gradeValue;
    private String status;
    private LocalDate registrationDate;
}
