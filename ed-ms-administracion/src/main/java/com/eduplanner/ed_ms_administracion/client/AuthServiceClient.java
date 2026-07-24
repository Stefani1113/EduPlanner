package com.eduplanner.ed_ms_administracion.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.eduplanner.ed_lib_common.dto.ActivationTokenRequestDTO;
import com.eduplanner.ed_lib_common.dto.ActivationTokenResponseDTO;

import lombok.RequiredArgsConstructor;

/**
 * cliente HTTp que habla con el ms de autenticación
 * para pedir token de activación
 * AuthServiceClient
 */
@Component
@RequiredArgsConstructor
public class AuthServiceClient {
    
    private final RestTemplate restTemplate;

    @Value("${service.auth.base-url}")
    private String authServiceBaseUrl;

    public String requestActivationToken(String email) {
        ActivationTokenRequestDTO request = new ActivationTokenRequestDTO();
        request.setEmail(email);

        ActivationTokenResponseDTO response = restTemplate.postForObject(
            authServiceBaseUrl + "/internal/tokens/activation",
            request,
            ActivationTokenResponseDTO.class);

        return response.getToken();
    }
}
