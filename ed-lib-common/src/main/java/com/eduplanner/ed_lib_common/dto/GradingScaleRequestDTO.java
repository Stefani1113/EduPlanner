package com.eduplanner.ed_lib_common.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** RF 9.1 - Configurar escala de calificación */
@Data
public class GradingScaleRequestDTO {

    @NotNull
    private BigDecimal minimumValue;

    @NotNull
    private BigDecimal maximumValue;

    @NotNull
    private BigDecimal minimumPassGrade;
}
