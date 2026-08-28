package com.eduplanner.ed_lib_common.dto;

import com.eduplanner.ed_lib_common.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/** HU 4.2 - Registrar tardanzas y salidas anticipadas y asistencia en general */
@Data
public class AttendanceRequestDTO {

    @NotNull
    private Integer idSchedule;

    @NotNull
    private Integer idStudent;

    @NotNull
    private LocalDate attendanceDate;

    @NotNull
    private AttendanceStatus attendanceStatus;

    private String observation;
}
