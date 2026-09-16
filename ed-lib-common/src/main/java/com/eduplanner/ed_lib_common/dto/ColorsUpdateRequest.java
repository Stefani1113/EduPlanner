package com.eduplanner.ed_lib_common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * RF 10 / RF 10.1: el administrador debe seleccionar EXACTAMENTE los 5
 * colores institucionales. Los 5 campos son obligatorios (@NotBlank);
 * si falta alguno, la validación de Bean Validation dispara un 400
 * que el GlobalExceptionHandler traduce al mensaje de negocio exigido:
 * "Debe seleccionar los 5 colores para completar la personalización".
 */
public record ColorsUpdateRequest(

        @NotBlank(message = "El color primario es obligatorio")
        @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "El color primario debe ser un hexadecimal válido, ej: #0FA000")
        String primaryColor,

        @NotBlank(message = "El color secundario es obligatorio")
        @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "El color secundario debe ser un hexadecimal válido, ej: #45E000")
        String secondaryColor,

        @NotBlank(message = "El color de acento es obligatorio")
        @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "El color de acento debe ser un hexadecimal válido, ej: #C8E8CF")
        String accentColor,

        @NotBlank(message = "El color de tarjeta es obligatorio")
        @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "El color de tarjeta debe ser un hexadecimal válido, ej: #171717")
        String cardBackground,

        @NotBlank(message = "El color de fondo secundario es obligatorio")
        @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "El color de fondo secundario debe ser un hexadecimal válido, ej: #202020")
        String secondaryBackground
) {
}
