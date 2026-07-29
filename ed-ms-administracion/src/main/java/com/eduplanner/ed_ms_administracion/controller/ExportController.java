package com.eduplanner.ed_ms_administracion.controller;

import com.eduplanner.ed_lib_common.enums.RolEnum;
import com.eduplanner.ed_ms_administracion.security.RequireRole;
import com.eduplanner.ed_ms_administracion.service.ExportService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/users/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;

    @RequireRole(RolEnum.ADMINISTRADOR)
    @GetMapping
    public ResponseEntity<byte[]> exportUsers() throws IOException {
        byte[] csvBytes = exportService.exportUsersToCsv();

        String fileName = "usuarios_" + LocalDate.now() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}