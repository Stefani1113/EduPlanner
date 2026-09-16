package com.eduplanner.ed_lib_common.dto;

import java.time.LocalTime;

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
    private Short slotOrder;
    private LocalTime startTime;
    private LocalTime endTime;

    private Byte dayOfWeek;
}

