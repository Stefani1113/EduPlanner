package com.eduplanner.ed_lib_common.dto;

import com.eduplanner.ed_lib_common.entity.TeacherAvailability;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TeacherAvailabilityResponseDTO {
    private Integer idAvailability;
    private Integer idTeacher;
    private Integer idTimeSlot;
    private Short dayOfWeek;
    private Boolean available;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TeacherAvailabilityResponseDTO fromEntity(TeacherAvailability a) {
        TeacherAvailabilityResponseDTO dto = new TeacherAvailabilityResponseDTO();
        dto.setIdAvailability(a.getIdAvailability());
        dto.setIdTeacher(a.getIdTeacher());
        dto.setIdTimeSlot(a.getIdTimeSlot());
        dto.setDayOfWeek(a.getDayOfWeek());
        dto.setAvailable(a.getAvailable());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setUpdatedAt(a.getUpdatedAt());
        return dto;
    }
}