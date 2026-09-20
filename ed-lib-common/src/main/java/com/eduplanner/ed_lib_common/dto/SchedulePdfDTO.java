package com.eduplanner.ed_lib_common.dto;

import java.util.List;

import lombok.Data;

@Data 
public class SchedulePdfDTO {

    private String fechaGeneracion;
    private String curso;
    private String periodo;
    private String docente;
    private String estudiante;

    private List<SchedulePdfRowDTO> filas;
}