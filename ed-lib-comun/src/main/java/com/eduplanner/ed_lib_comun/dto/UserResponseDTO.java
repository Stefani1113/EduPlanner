package com.eduplanner.ed_lib_comun.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UserResponseDTO {
    private Integer idUser;
    private String name;
    private String lasName;
    private String email;
    private String document;
    private String documentType;
    private String phoneNumber;
    private LocalDate birthdate;
    private Boolean state;
    private LocalDateTime creationDate;
    private LocalDateTime lastAccess;
    private Integer idRole;
    private String roleName;
}

