package com.eduplanner.ed_lib_common.dto;

import java.time.LocalDate;

import lombok.Data;

/**
 * Registro de estudiante 
 * RegisterStudentDTO
 */
@Data
public class RegisterStudentDTO {
    
    private String name;

    private String surnames;

    private String email;

    private String phoneNumber;

    private String document;

    private String documentType;

    private String documentIssuePlace;

    private boolean status;

    private String gender;

    private LocalDate birthdate;

    private String address;

    private String bloodType;

    private String disabilities;

    private Byte stratum;

    private String populationType;

    private String healthRegime;

    private String eps;

    private Integer idImport;

    private Integer idInstitution;

    private Integer idRole;

    //datos anidados de acudiente 
    private GuardianDTO guardian;

}
