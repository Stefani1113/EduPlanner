package com.eduplanner.ed_lib_comun.dto;

import lombok.Data;

@Data

public class ForgotPasswordRequestDTO {
    
    /**
     * Correo electronico del usuario
     */
    private String email;
}
