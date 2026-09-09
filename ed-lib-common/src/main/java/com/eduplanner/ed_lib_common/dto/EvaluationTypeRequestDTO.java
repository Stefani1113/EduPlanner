package com.eduplanner.ed_lib_common.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EvaluationTypeRequestDTO {

    @NotNull
    private Integer idScale;

    private BigDecimal numericGrade;

    private String letterGrade;
}
