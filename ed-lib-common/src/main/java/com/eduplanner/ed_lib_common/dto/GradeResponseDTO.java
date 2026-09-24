package com.eduplanner.ed_lib_common.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GradeResponseDTO {
    private Integer idGrade;

    private Integer idStudent;
    private String studentName;

    private Integer idCourse;
    private String courseName;

    private Integer idTeacher;
    private String teacherName;

    private Integer idPeriod;
    private String periodName;

    private Integer idSubject;
    private String subjectName;

    private Integer idEvaluative;
    private Integer idEvaluationType;
    private BigDecimal gradeValue;
    private String status;
    private LocalDate registrationDate;
}
