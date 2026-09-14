package com.eduplanner.ed_lib_common.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class EvaluationTypeResponseDTO {
    private Integer idEvaluationType;
    private Integer idScale;
    private BigDecimal numericGrade;
    private String letterGrade;
}
