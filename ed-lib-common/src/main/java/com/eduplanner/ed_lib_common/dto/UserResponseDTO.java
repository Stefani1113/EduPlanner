package com.eduplanner.ed_lib_common.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UserResponseDTO {
    
    private Integer idUser;

    private String email;

    private String name;

    private String surnames;

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

    private LocalDateTime lastAccess;

    private String roleName;

    private Integer idRole;

    private Integer idInstitution;
}
