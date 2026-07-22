package com.eduplanner.ed_lib_common.dto;

import lombok.Data;

@Data
public class ForgotPasswordRequestDTO {

    /**
     * correo eléctronico del usuario
     */
    private String email;
}
