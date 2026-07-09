package com.eduplanner.ed_lib_common.dto;

import lombok.Data;

@Data
public class ResetPasswordRequestDTO {

    /**
     * Token generado para la restauración de contraseña
     */
    private String token;

    /**
     * Nueva contraseña del usuario
     */
    private String newPassword;

}
