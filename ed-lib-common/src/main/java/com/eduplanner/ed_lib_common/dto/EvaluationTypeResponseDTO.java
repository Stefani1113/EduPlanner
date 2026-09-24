package com.eduplanner.ed_lib_common.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class EvaluationTypeResponseDTO {
    private Integer idEvaluationType;
    private Integer idScale;
    private BigDecimal numericGrade;
    private String letterGrade;
}
