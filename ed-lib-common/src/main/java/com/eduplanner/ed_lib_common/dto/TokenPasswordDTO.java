package com.eduplanner.ed_lib_common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class TokenPasswordDTO {

    /**
     * Token generado para la restauración de contraseña
     */
    @NotBlank(message = "El token es obligatorio")
    private String token;

    /**
     * Nueva contraseña del usuario
     */
    @NotBlank(message = "La nueva contraseña es obligatoria")

    /**
     * Expresión regular para validación de contraseña
     */
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#.\\-_])[A-Za-z\\d@$!%*?&#.\\-_]{8,}$",
        message = "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"
    )

    private String newPassword;

}
