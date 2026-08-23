package com.eduplanner.ed_lib_common.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Data
public class AcademicPeriodResponseDTO {
    
    private Integer idPeriod;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
