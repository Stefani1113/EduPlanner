package com.EduPlanner.ed_ms_gestion_academica.controller;

import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.dto.ScheduleGenerationRequestDTO;
import com.eduplanner.ed_lib_common.entity.AcademicTeacher;
import com.eduplanner.ed_lib_common.entity.Schedule;
import com.EduPlanner.ed_ms_gestion_academica.client.AdministracionServiceClient;
import com.EduPlanner.ed_ms_gestion_academica.repository.AcademicTeacherRepository;
import com.EduPlanner.ed_ms_gestion_academica.service.ScheduleService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService service;
    private final AcademicTeacherRepository academicTeacherRepository;

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

    /**
     * Ruta para traer horario de curso
     */
    @GetMapping("/course/{idCourse}")
    public ResponseEntity<HttpGlobalResponse<List<Schedule>>> getByCourse(
            @PathVariable Integer idCourse) {

        HttpGlobalResponse<List<Schedule>> response =
                new HttpGlobalResponse<>();

        List<Schedule> schedules =
                service.getScheduleByCourse(idCourse);

        response.setData(schedules);
        response.setMessage("Horario del curso consultado correctamente");

        return ResponseEntity.ok(response);
    }
    
    /**
     * Ruta para buscar horario de docente
     * @param idTeacher
     * @return
     */
    @GetMapping("/teacher/{idTeacher}")
    public ResponseEntity<HttpGlobalResponse<List<Schedule>>> getByTeacher(
            @PathVariable Integer idTeacher) {

        HttpGlobalResponse<List<Schedule>> response =
                new HttpGlobalResponse<>();

        List<Schedule> schedules =
                service.getScheduleByTeacher(idTeacher);

        response.setData(schedules);
        response.setMessage("Horario del docente consultado correctamente");

        return ResponseEntity.ok(response);
    }

    /**
     * Ruta para traer horario de docente y estudiante 
     * @param idUser
     * @param role
     * @return
     */
    @GetMapping("/my-schedule")
    public ResponseEntity<HttpGlobalResponse<List<Schedule>>> getMySchedule(
            @RequestAttribute("idUser") Integer idUser,
            @RequestAttribute("role") String role) {

        HttpGlobalResponse<List<Schedule>> response =
                new HttpGlobalResponse<>();

        try {
            List<Schedule> schedules =
                    service.getMySchedule(idUser, role);

            response.setData(schedules);
            response.setMessage("Horario consultado correctamente");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            response.setMessage(e.getMessage());

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(response);
        }
    }
}

