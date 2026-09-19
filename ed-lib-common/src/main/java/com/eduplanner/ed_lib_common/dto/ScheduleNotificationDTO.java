package com.eduplanner.ed_lib_common.dto;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data 
@RequiredArgsConstructor 
public class ScheduleNotificationDTO {
    private String type;
    private String title;
    private String message;
    private Integer idCourse;
    private Integer idTeacher;
}

