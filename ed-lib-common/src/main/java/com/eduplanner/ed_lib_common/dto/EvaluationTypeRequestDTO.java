package com.eduplanner.ed_lib_common.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class EvaluationTypeRequestDTO {
    @NotNull private Integer idScale;
    private BigDecimal numericGrade;
    private String letterGrade;
}
