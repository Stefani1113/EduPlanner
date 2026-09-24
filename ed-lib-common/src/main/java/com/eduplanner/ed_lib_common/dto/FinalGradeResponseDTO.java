package com.eduplanner.ed_lib_common.dto;

import lombok.Data;

import java.math.BigDecimal;

/** Respuesta de nota definitiva (RF 9.2), con nombres resueltos vía Feign. */
@Data
public class FinalGradeResponseDTO {

    private Integer idFinal;

    private Integer idStudent;
    private String studentName;

    private Integer idSubject;
    private String subjectName;

    private Integer idPeriod;
    private String periodName;

    private BigDecimal finalGrade;
    private Boolean passed;
}
