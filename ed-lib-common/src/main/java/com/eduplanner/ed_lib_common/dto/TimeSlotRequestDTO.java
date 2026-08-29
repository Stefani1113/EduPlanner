package com.eduplanner.ed_lib_common.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalTime;

@Data
public class TimeSlotRequestDTO {
    @NotNull(message = "La jornada (id_shift) es obligatoria")
    private Integer idShift;

    @NotNull(message = "El orden del bloque es obligatorio")
    private Short slotOrder;

    @NotNull(message = "La hora de inicio es obligatoria")
    private LocalTime startTime;

    @NotNull(message = "La hora de fin es obligatoria")
    private LocalTime endTime;

    private Boolean isBreak = false;
}