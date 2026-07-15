package com.eduplanner.ed_lib_common.dto;

import lombok.Data;

@Data
public class JwtDTO {

    /**
     * JWT del usuario logueado
     */
    private String token;
}
