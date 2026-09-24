package com.eduplanner.ed_lib_common.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class ImportReportDTO {
    
    private Integer idImport;

    private String fileName;

    private LocalDateTime importDate;

    private Integer totalRows;

    private Integer successRows;

    private Integer failedRows;

    private List<ImportErrorDetailDTO> errors; 
}
