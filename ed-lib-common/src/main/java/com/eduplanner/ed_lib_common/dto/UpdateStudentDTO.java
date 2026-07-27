package com.eduplanner.ed_lib_common.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class UpdateStudentDTO {

    private String name;

    private String surnames;

    private String phoneNumber;

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

    // Se actualiza junto con el estudiante
    private GuardianDTO guardian;
}