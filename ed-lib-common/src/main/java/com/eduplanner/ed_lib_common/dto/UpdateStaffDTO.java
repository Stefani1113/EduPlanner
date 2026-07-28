// ed-lib-common/src/main/java/com/eduplanner/ed_lib_common/dto/UpdateStaffDTO.java
package com.eduplanner.ed_lib_common.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class UpdateStaffDTO {

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

    private String position;
    
}