package com.eduplanner.ed_lib_common.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Justificación de inasistencias paso 2: un directivo/docente revisa y aprueba o rechaza. */
@Data
public class JustificationReviewDTO {

    @NotNull
    private Boolean approved;

    @NotNull
    private Integer reviewedBy;
}
