package com.eduplanner.ed_lib_common.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CourseResponseDTO {
    private Integer idCourse;
    private Integer idPeriod;
    private Integer idLevel;
    private Integer idShift;
    private Integer homeroomTeacher;
    private String name;
    private Short studentCount;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
