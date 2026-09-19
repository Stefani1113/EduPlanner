package com.eduplanner.ed_lib_common.dto;

import lombok.Data;

@Data 
public class ScheduleNotificationDTO {
    private String type;
    private String title;
    private String message;
    private Integer idCourse;
    private Integer idTeacher;
}

