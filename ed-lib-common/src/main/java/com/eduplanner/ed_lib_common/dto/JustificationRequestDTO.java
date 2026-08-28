package com.eduplanner.ed_lib_common.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Justificación de inasistencias, paso 1: el estudiante/acudiene ingresa el texto. */
@Data
public class JustificationRequestDTO {

    @NotBlank
    private String justificationText;
}
