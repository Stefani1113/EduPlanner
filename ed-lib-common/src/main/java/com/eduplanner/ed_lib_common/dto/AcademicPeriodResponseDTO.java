package com.eduplanner.ed_lib_common.dto;

import com.eduplanner.ed_lib_common.entity.AcademicPeriod;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AcademicPeriodResponseDTO {
    private Integer idPeriod;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AcademicPeriodResponseDTO fromEntity(AcademicPeriod p) {
        AcademicPeriodResponseDTO dto = new AcademicPeriodResponseDTO();
        dto.setIdPeriod(p.getIdPeriod());
        dto.setName(p.getName());
        dto.setStartDate(p.getStartDate());
        dto.setEndDate(p.getEndDate());
        dto.setStatus(p.getStatus());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }
}