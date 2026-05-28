package com.eduplanner.ed_lib_comun.dto;

import lombok.Data;

@Data
public class UpdateRolRequestDTO {
    /** Nuevo rol: 1=ADMINISTRADOR, 2=ESTUDIANTE, 3=DOCENTE, 4=SISTEMA */
    private Integer idRole;
}
