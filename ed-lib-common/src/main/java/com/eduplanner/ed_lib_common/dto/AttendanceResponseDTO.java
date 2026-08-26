package com.eduplanner.ed_lib_common.dto;

import com.eduplanner.ed_lib_common.enums.AttendanceStatus;
import com.eduplanner.ed_lib_common.enums.JustificationStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AttendanceResponseDTO {
    private Integer idAttendance;
    private Integer idSchedule;
    private Integer idStudent;
    private LocalDate attendanceDate;
    private AttendanceStatus attendanceStatus;
    private String observation;
    private String justificationText;
    private JustificationStatus justificationStatus;
    private Integer reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
