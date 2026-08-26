package com.eduplanner.ed_lib_common.dto;

import com.eduplanner.ed_lib_common.entity.AcademicLevel;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AcademicLevelResponseDTO {
    private Integer idLevel;
    private String name;
    private String description;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AcademicLevelResponseDTO fromEntity(AcademicLevel l) {
        AcademicLevelResponseDTO dto = new AcademicLevelResponseDTO();
        dto.setIdLevel(l.getIdLevel());
        dto.setName(l.getName());
        dto.setDescription(l.getDescription());
        dto.setStatus(l.getStatus());
        dto.setCreatedAt(l.getCreatedAt());
        dto.setUpdatedAt(l.getUpdatedAt());
        return dto;
    }
}