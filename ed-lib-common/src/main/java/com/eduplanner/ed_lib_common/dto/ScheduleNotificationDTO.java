package com.eduplanner.ed_lib_common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleNotificationDTO {

    private String type;
    private String title;
    private String message;
    private Integer idSchedule;
}