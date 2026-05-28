package com.eduplanner.ed_lib_comun.dto;

import lombok.Data;

@Data
public class LoginRequestDTO {
    /** RF 1.2 - Correo personal del usuario */
    private String email;

    /** RF 1.2 - Contraseña del usuario */
    private String password;
}
