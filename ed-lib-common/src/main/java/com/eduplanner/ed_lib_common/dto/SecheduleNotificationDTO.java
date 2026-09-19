package com.eduplanner.ed_lib_common.dto;

import lombok.Data;

@Data 
public class SecheduleNotificationDTO {
    private String type;
    private String title;
    private String message;
    private Integer idCourse;
    private Integer idTeacher;
}

