package com.eduplanner.ed_lib_common.dto;

import lombok.Data;

@Data
public class UpdateRoleDTO {
    
    private Integer idRole;

    /**
     * Solo es obligatorio cuando el rol es administrador o directivo
     */
    private String position;
}
