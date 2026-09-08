package com.eduplanner.ed_ms_administracion.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.eduplanner.ed_lib_common.dto.ActivationTokenRequestDTO;
import com.eduplanner.ed_lib_common.dto.ActivationTokenResponseDTO;

/**
 * cliente HTTP que habla con el ms de autenticación
 * para pedir token de activación
 * AuthServiceClient
 */
@FeignClient(name = "ed-ms-autenticacion")
public interface AuthServiceClient {

    @PostMapping("/eduplanner/internal/tokens/activation")
    ActivationTokenResponseDTO requestActivationToken(
            @RequestBody ActivationTokenRequestDTO request
    );
}