package com.eduplanner.ed_lib_common.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AcademicTeacherResponseDTO {
    private Integer idAcademicTeacher;
    private Integer idUser;
    private Byte maxDailyHours;
    private Byte maxWeeklyHours;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
