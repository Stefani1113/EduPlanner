package com.eduplanner.ed_lib_common.dto;

import lombok.Data;

@Data
public class LoginRequestDTO {
    
    /**
     * Correo del usuario
     */
    private String email;

    /**
     * Contraseña del usuario
     */
    private String password;
}
