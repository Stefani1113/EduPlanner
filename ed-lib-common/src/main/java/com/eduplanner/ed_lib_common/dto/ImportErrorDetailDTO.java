package com.eduplanner.ed_lib_common.dto;

import lombok.Data;

@Data
public class ImportErrorDetailDTO {

    private Integer rowNumber;

    private String rowData;

    private String error;
}
