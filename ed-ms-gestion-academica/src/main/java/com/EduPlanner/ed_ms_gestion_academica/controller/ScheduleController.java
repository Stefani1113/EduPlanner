package com.EduPlanner.ed_ms_gestion_academica.controller;

import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.dto.ScheduleGenerationRequestDTO;
import com.EduPlanner.ed_ms_gestion_academica.service.ScheduleService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService service;

    /**
     * Guardar una generación de horario
     */
    @PostMapping("/generations")
    public ResponseEntity<HttpGlobalResponse<Integer>> saveGeneration(
            @RequestBody ScheduleGenerationRequestDTO dto) {

        HttpGlobalResponse<Integer> response = new HttpGlobalResponse<>();

        try {
            Integer generationId = service.saveGeneration(dto);

            response.setData(generationId);
            response.setMessage("Horario generado y guardado correctamente");

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (IllegalArgumentException e) {

            response.setMessage(e.getMessage());

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(response);
        }
    }
}
