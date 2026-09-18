package com.eduplanner.ed_lib_common.dto;

import lombok.Data;

@Data 
public class SchedulePdfRowDTO {

    private String horaInicio;
    private String horaFin;

    private String lunes;
    private String martes;
    private String miercoles;
    private String jueves;
    private String viernes;
}
