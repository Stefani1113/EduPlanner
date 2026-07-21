package com.eduplanner.ed_lib_common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data
@AllArgsConstructor
public class JwtDTO {

    /**
     * JWT del usuario logueado
     */
    private String token;
}
