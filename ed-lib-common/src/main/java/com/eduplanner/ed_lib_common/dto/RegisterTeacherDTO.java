package com.eduplanner.ed_lib_common.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Registro de docente
 * RegisterTeacherDTO
 */
@Data
public class RegisterTeacherDTO {
    
    private String name;

    private String surnames;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no tiene un formato válido")
    private String email;

    private String phoneNumber;

    private String document;

    private String documentType;

    private String documentIssuePlace;

    private String gender;

    private LocalDate birthdate;

    private String address;

    private String bloodType;

    private String disabilities;

    private Integer stratum;

    private String populationType;

    private String healthRegime;

    private String eps;

    private String professionalDegrees;

    private String qualificationsDesc;
}
