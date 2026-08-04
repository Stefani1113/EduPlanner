package com.eduplanner.ed_lib_common.dto;


import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

/**
 * RF 5 / RF 5.1 - Datos para crear o editar un perfil de docente.
 */
@Data
public class TeachingRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Los apellidos son obligatorios")
    @Size(max = 150)
    private String surnames;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Formato de correo inválido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;

    @NotBlank(message = "El tipo de documento es obligatorio")
    private String documentType;

    @NotBlank(message = "El número de documento es obligatorio")
    private String document;

    private String documentIssuePlace;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    private LocalDate birthdate;

    private String phoneNumber;

    private String photoUrl;

    @NotBlank(message = "Los títulos profesionales son obligatorios")
    private String professionalDegrees;

    private String qualificationsDesc;

    @NotBlank(message = "El género es obligatorio")
    private String gender;

    private String address;

    @NotBlank(message = "El tipo de sangre es obligatorio")
    private String bloodType;

    private String disabilities;

    @NotNull(message = "El estrato es obligatorio")
    @Min(value = 1) @Max(value = 6)
    private Integer stratum;

    private String populationType;
    private String healthRegime;
    private String eps;

    @NotBlank(message = "El cargo es obligatorio")
    private String position;

    @NotNull(message = "La institución es obligatoria")
    private Integer idInstitution;
}
