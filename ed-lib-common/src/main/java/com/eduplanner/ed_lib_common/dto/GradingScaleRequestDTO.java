package com.eduplanner.ed_lib_common.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class GradingScaleRequestDTO {
    @NotNull private BigDecimal minimumValue;
    @NotNull private BigDecimal maximumValue;
    @NotNull private BigDecimal minimumPassGrade;
}
