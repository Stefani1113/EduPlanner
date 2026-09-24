package com.eduplanner.ed_lib_common.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SubjectResponseDTO {
    private Integer idSubject;
    private String name;
    private String description;
    private String color;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
