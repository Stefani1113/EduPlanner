package com.eduplanner.ed_lib_common.dto;

import lombok.Data;

/**
 * DTO para facilitar el diseño del horario
 * ScheduleResponseDTO
 */
@Data
public class ScheduleResponseDTO {

    private Integer idSchedule;

    private Integer idCourse;

    private Integer idSubject;
    private String subjectName;

    private Integer idTeacher;
    private String teacherName;

    private Integer idTimeSlot;
    private String startTime;
    private String endTime;

    private Byte dayOfWeek;
}

