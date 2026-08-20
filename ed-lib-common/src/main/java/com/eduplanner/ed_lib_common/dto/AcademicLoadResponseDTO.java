package com.eduplanner.ed_lib_common.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AcademicLoadResponseDTO {
    private Integer idAcademicLoad;
    private Integer idTeacher;
    private Integer idCourse;
    private Integer idSubject;
    private Byte weeklyHours;
    private Byte priority;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
