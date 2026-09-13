package com.eduplanner.ed_ms_administracion.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.dto.SupportRequestRequestDTO;
import com.eduplanner.ed_ms_administracion.service.SupportRequestService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.apache.hc.core5.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


/**
 * Ruta publica para enviar solicitud de soporte
 * SupportRequestController
 */
@RestController
@RequestMapping("/support")
@RequiredArgsConstructor
public class SupportRequestController {
    
    private final SupportRequestService supportRequestService;

    @PostMapping
    public ResponseEntity<HttpGlobalResponse<Void>> submit(@Valid @RequestBody SupportRequestRequestDTO dto) {
        HttpGlobalResponse<Void> response = new HttpGlobalResponse<>();
        supportRequestService.submit(dto);
        response.setMessage("Tu mensaje fue enviado correctamente. Te responderemos pronto.");
        return ResponseEntity.status(HttpStatus.SC_CREATED).body(response);
    }
    
}
