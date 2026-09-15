package com.eduplanner.ed_lib_common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EvaluativeActivityRequestDTO {
    @NotNull private Integer idPeriod;
    @NotNull private LocalDate startDate;
    @NotNull private LocalDate endDate;
    @NotBlank private String evaluationName;
    @NotNull private BigDecimal weightPercentage;
}
