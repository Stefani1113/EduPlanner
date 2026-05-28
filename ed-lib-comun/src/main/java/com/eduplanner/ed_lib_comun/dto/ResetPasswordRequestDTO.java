package com.eduplanner.ed_lib_comun.dto;

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
