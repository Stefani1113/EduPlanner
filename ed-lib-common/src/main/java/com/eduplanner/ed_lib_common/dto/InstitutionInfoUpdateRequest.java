package com.eduplanner.ed_lib_common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record InstitutionInfoUpdateRequest(

        @NotBlank(message = "El nombre corto es obligatorio")
        @Size(max = 100, message = "El nombre corto no puede superar 100 caracteres")
        String shortName,

        @NotBlank(message = "El nombre largo es obligatorio")
        @Size(max = 200, message = "El nombre largo no puede superar 200 caracteres")
        String longName,

        @Size(max = 65535, message = "La descripción es demasiado extensa")
        String description
) {
}
