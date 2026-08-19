package com.eduplanner.ed_lib_common.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/** RF 8.1.1 - Register course info (name, level, shift, student count) */
@Data
public class CourseRequestDTO {
    @NotNull private Integer idPeriod;
    @NotNull private Integer idLevel;
    @NotNull private Integer idShift;
    private Integer homeroomTeacher;
    @NotBlank @Size(max = 20) private String name;
    @NotNull @Min(0) private Short studentCount;
}
