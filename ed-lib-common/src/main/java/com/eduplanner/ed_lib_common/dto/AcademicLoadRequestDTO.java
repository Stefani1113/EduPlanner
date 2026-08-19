package com.eduplanner.ed_lib_common.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/** RF 8.1.2 - Register academic load (subject + teacher + course + weekly hours) */
@Data
public class AcademicLoadRequestDTO {
    @NotNull private Integer idTeacher;
    @NotNull private Integer idCourse;
    @NotNull private Integer idSubject;
    @NotNull @Min(1) private Byte weeklyHours;
    @Min(1) @Max(5) private Byte priority = 1;
}
