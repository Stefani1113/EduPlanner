package com.eduplanner.ed_lib_common.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EvaluativeActivityResponseDTO {
    private Integer idEvaluative;
    private Integer idPeriod;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isActive;
    private String evaluationName;
    private BigDecimal weightPercentage;
}
