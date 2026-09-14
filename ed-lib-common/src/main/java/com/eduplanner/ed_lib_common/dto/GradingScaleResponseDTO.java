package com.eduplanner.ed_lib_common.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class GradingScaleResponseDTO {
    private Integer idScale;
    private BigDecimal minimumValue;
    private BigDecimal maximumValue;
    private BigDecimal minimumPassGrade;
}
