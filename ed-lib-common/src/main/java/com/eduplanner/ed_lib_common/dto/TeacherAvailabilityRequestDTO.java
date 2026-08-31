package com.eduplanner.ed_lib_common.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TeacherAvailabilityRequestDTO {
    @NotNull(message = "El docente (id_teacher) es obligatorio")
    private Integer idTeacher;

    @NotNull(message = "El bloque horario (id_time_slot) es obligatorio")
    private Integer idTimeSlot;

    @NotNull(message = "El día de la semana es obligatorio")
    @Min(value = 1, message = "El día debe estar entre 1 (lunes) y 6 (sabado)")
    @Max(value = 6, message = "El día debe estar entre 1 (lunes) y 6 (sabado)")
    private Short dayOfWeek;

    private Boolean available = true;
}