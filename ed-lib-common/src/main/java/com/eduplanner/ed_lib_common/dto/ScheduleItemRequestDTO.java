package com.eduplanner.ed_lib_common.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ScheduleItemRequestDTO {

    @NotNull
    private Integer idAcademicLoad;

    @NotNull
    private Integer idTimeSlot;

    @NotNull
    @Min(1)
    @Max(7)
    private Byte dayOfWeek;
}