package com.eduplanner.ed_lib_common.dto;

import com.eduplanner.ed_lib_common.entity.TimeSlot;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class TimeSlotResponseDTO {
    private Integer idTimeSlot;
    private Integer idShift;
    private Short slotOrder;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isBreak;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TimeSlotResponseDTO fromEntity(TimeSlot t) {
        TimeSlotResponseDTO dto = new TimeSlotResponseDTO();
        dto.setIdTimeSlot(t.getIdTimeSlot());
        dto.setIdShift(t.getIdShift());
        dto.setSlotOrder(t.getSlotOrder());
        dto.setStartTime(t.getStartTime());
        dto.setEndTime(t.getEndTime());
        dto.setIsBreak(t.getIsBreak());
        dto.setStatus(t.getStatus());
        dto.setCreatedAt(t.getCreatedAt());
        dto.setUpdatedAt(t.getUpdatedAt());
        return dto;
    }
}