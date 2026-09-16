package com.eduplanner.ed_lib_common.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserInfoDTO {
    private Integer idUser;
    private String name;
    private String surnames;
    private String email;
    private String roleName;
    private Integer idRole;
    private Boolean status;
}
