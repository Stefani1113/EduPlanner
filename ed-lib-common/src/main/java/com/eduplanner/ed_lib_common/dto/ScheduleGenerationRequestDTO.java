package com.eduplanner.ed_lib_common.dto;


import com.eduplanner.ed_lib_common.entity.ScheduleGenerationType;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;


import java.util.List;

@Data
public class ScheduleGenerationRequestDTO {

    @NotNull
    private Integer idPeriod;

    @NotNull
    private ScheduleGenerationType generationType;

    @NotNull
    private Integer generatedBy;

    private String observations;

    private ScheduleGenerationType scheduleType = ScheduleGenerationType.REGULAR;

    @NotEmpty
    @Valid
    private List<ScheduleItemRequestDTO> schedules;
}