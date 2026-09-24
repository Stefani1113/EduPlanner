package com.eduplanner.ed_lib_common.dto;


import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * RF 5.2 - Información del perfil del docente visible para todos los roles.
 */
@Data
public class TeachingResponseDTO {
    private Integer idUser;
    private String name;
    private String surnames;
    private String email;
    private String documentType;
    private String document;
    private String documentIssuePlace;
    private LocalDate birthdate;
    private String phoneNumber;
    private Boolean status;
    private String photoUrl;
    private String professionalDegrees;
    private String qualificationsDesc;
    private String gender;
    private String address;
    private String bloodType;
    private String disabilities;
    private Integer stratum;
    private String populationType;
    private String healthRegime;
    private String eps;
    private String position;
    private LocalDateTime creationDate;
    private LocalDateTime updateDate;
    private Integer idInstitution;
    private String rol;
}
