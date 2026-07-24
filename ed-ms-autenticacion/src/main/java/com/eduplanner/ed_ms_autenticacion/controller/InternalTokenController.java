package com.eduplanner.ed_ms_autenticacion.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eduplanner.ed_lib_common.dto.ActivationTokenRequestDTO;
import com.eduplanner.ed_lib_common.dto.ActivationTokenResponseDTO;
import com.eduplanner.ed_ms_autenticacion.service.JwtService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Endpoinst internos que solo pueden ser llamados por otros microservicios 
 * InternalTokenController
 */

@RestController
@RequestMapping("/internal/tokens")
@RequiredArgsConstructor
public class InternalTokenController {
    
    private final JwtService jwtService;

    @PostMapping("/activation")
    public ActivationTokenResponseDTO generaActivationToken (@RequestBody ActivationTokenRequestDTO request) {
        String token = jwtService.generateAccountActivationToken(request.getEmail());

        ActivationTokenResponseDTO response = new ActivationTokenResponseDTO();
        response.setToken(token);
        return response;
    }
    
}
