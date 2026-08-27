package com.eduplanner.ed_lib_common.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AcademicLevelRequestDTO {
    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    private String description;
}