package com.eduplanner.ed_lib_common.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** RF 9 - Registrar notas */
@Data
public class GradeRequestDTO {

    @NotNull
    private Integer idStudent;

    @NotNull
    private Integer idCourse;

    @NotNull
    private Integer idTeacher;

    @NotNull
    private Integer idPeriod;

    @NotNull
    private Integer idSubject;

    @NotNull
    private Integer idEvaluative;

    @NotNull
    private Integer idEvaluationType;

    @NotNull
    private BigDecimal gradeValue;
}
