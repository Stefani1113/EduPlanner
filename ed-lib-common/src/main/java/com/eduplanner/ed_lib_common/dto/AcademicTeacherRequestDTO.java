package com.eduplanner.ed_lib_common.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/** RF 8.1 - Register teacher academic info (availability, workload) */
@Data
public class AcademicTeacherRequestDTO {
    @NotNull private Integer idUser;
    @NotNull @Min(1) private Byte maxDailyHours;
    @NotNull @Min(1) private Byte maxWeeklyHours;
}
