package com.eduplanner.ed_lib_common.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupportRequestRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    private String senderName;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no tiene un formato válido")
    private String senderEmail;

    @NotBlank(message = "El asunto es obligatorio")
    private String subject;

    @NotBlank(message = "El mensaje es obligatorio")
    private String message;
}