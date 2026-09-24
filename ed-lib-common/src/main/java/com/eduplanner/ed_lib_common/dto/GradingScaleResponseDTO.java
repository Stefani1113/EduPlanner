package com.eduplanner.ed_lib_common.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class GradingScaleResponseDTO {
    private Integer idScale;
    private BigDecimal minimumValue;
    private BigDecimal maximumValue;
    private BigDecimal minimumPassGrade;
}
