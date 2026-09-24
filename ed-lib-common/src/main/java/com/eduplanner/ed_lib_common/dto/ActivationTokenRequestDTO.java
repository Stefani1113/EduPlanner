package com.eduplanner.ed_lib_common.dto;

import lombok.Data;

/**
 * DTo para pedir token de activación al ms de autenticacion
 * ActivationTokenRequestDTO
 */
@Data
public class ActivationTokenRequestDTO {
    
    private String email;
}
