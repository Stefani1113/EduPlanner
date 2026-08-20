package com.eduplanner.ed_lib_common.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SubjectRequestDTO {
    @NotBlank @Size(max = 100) private String name;
    @Size(max = 255) private String description;
    @Size(max = 20) private String color;
}
