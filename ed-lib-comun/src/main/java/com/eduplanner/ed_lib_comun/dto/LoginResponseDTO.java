package com.eduplanner.ed_lib_comun.dto;

import lombok.Data;

@Data
public class LoginResponseDTO {
    private String token;
    private Integer idUser;
    private String name;
    private String lastName;
    private String email;
    private String role;
}
