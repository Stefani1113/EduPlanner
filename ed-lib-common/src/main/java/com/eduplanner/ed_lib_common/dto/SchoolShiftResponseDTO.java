package com.eduplanner.ed_lib_common.dto;

import com.eduplanner.ed_lib_common.entity.SchoolShift;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class SchoolShiftResponseDTO {
    private Integer idShift;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SchoolShiftResponseDTO fromEntity(SchoolShift s) {
        SchoolShiftResponseDTO dto = new SchoolShiftResponseDTO();
        dto.setIdShift(s.getIdShift());
        dto.setName(s.getName());
        dto.setStartTime(s.getStartTime());
        dto.setEndTime(s.getEndTime());
        dto.setStatus(s.getStatus());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setUpdatedAt(s.getUpdatedAt());
        return dto;
    }
}