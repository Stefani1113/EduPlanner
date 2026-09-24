package com.eduplanner.ed_lib_common.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class GradeRequestDTO {
    @NotNull private Integer idStudent;
    @NotNull private Integer idCourse;
    @NotNull private Integer idTeacher;
    @NotNull private Integer idPeriod;
    @NotNull private Integer idSubject;
    @NotNull private Integer idEvaluative;
    @NotNull private Integer idEvaluationType;
    @NotNull private BigDecimal gradeValue;
}
