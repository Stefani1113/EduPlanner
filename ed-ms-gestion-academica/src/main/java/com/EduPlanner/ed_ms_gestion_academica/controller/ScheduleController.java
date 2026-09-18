package com.EduPlanner.ed_ms_gestion_academica.controller;

import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.dto.ScheduleGenerationRequestDTO;
import com.eduplanner.ed_lib_common.dto.SchedulePdfDTO;
import com.eduplanner.ed_lib_common.dto.ScheduleResponseDTO;
import com.eduplanner.ed_lib_common.entity.AcademicPeriod;
import com.eduplanner.ed_lib_common.entity.Course;
import com.eduplanner.ed_lib_common.enums.RolEnum;
import com.EduPlanner.ed_ms_gestion_academica.client.AdministracionServiceClient;
import com.EduPlanner.ed_ms_gestion_academica.security.RequireRole;
import com.EduPlanner.ed_ms_gestion_academica.service.SchedulePdfService;
import com.EduPlanner.ed_ms_gestion_academica.service.ScheduleService;

import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
public class ScheduleController {

        private final ScheduleService service;
        private final SchedulePdfService pdfService;
        private final AdministracionServiceClient administracionServiceClient;

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
        @RequireRole(RolEnum.ADMINISTRADOR)
        @GetMapping("/course/{idCourse}")
        public ResponseEntity<HttpGlobalResponse<List<ScheduleResponseDTO>>> getByCourse(
                @PathVariable Integer idCourse) {

                HttpGlobalResponse<List<ScheduleResponseDTO>> response =
                        new HttpGlobalResponse<>();

                List<ScheduleResponseDTO> schedules =
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
        @RequireRole(RolEnum.ADMINISTRADOR)
        @GetMapping("/teacher/{idTeacher}")
        public ResponseEntity<HttpGlobalResponse<List<ScheduleResponseDTO>>> getByTeacher(
                @PathVariable Integer idTeacher) {

                HttpGlobalResponse<List<ScheduleResponseDTO>> response =
                        new HttpGlobalResponse<>();

                List<ScheduleResponseDTO> schedules = service.getScheduleByTeacher(idTeacher);

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
        public ResponseEntity<HttpGlobalResponse<List<ScheduleResponseDTO>>> getMySchedule(
                @RequestAttribute("idUser") Integer idUser,
                @RequestAttribute("role") String role) {

                HttpGlobalResponse<List<ScheduleResponseDTO>> response =
                        new HttpGlobalResponse<>();

                try {
                List<ScheduleResponseDTO> schedules =
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

        /**
         * Metodo para publicar horario
         */
        @RequireRole(RolEnum.ADMINISTRADOR)
        @PutMapping("/generations/{idGeneration}/publish")
        public ResponseEntity<HttpGlobalResponse<Void>> publishGeneration(
                @PathVariable Integer idGeneration) {

                HttpGlobalResponse<Void> response =
                        new HttpGlobalResponse<>();

                try {

                service.publishGeneration(idGeneration);

                response.setMessage(
                        "Horario publicado correctamente"
                );

                return ResponseEntity.ok(response);

                } catch (IllegalArgumentException e) {

                response.setMessage(e.getMessage());

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(response);
                }
        }

        /**
         * Previsualización de horario antes de publicar
         */
        @RequireRole(RolEnum.ADMINISTRADOR)
        @GetMapping("/generations/{idGeneration}")
        public ResponseEntity<
                HttpGlobalResponse<List<ScheduleResponseDTO>>
                > previewGeneration(
                        @PathVariable Integer idGeneration) {

                HttpGlobalResponse<List<ScheduleResponseDTO>> response =
                        new HttpGlobalResponse<>();

                try {

                List<ScheduleResponseDTO> schedules =
                        service.previewGeneration(idGeneration);

                response.setData(schedules);
                response.setMessage(
                        "Previsualización consultada correctamente"
                );

                return ResponseEntity.ok(response);

                } catch (IllegalArgumentException e) {

                response.setMessage(e.getMessage());

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(response);
                }
        }

        /**
         * Eliminar horario académico
         */
        @RequireRole(RolEnum.ADMINISTRADOR)
        @DeleteMapping("/generations/{idGeneration}")
        public ResponseEntity<HttpGlobalResponse<Void>> deleteGeneration(
                @PathVariable Integer idGeneration) {

                HttpGlobalResponse<Void> response =
                        new HttpGlobalResponse<>();

                try {

                service.deleteGeneration(idGeneration);

                response.setMessage(
                        "Generación eliminada correctamente"
                );

                return ResponseEntity.ok(response);

                } catch (IllegalArgumentException e) {

                response.setMessage(e.getMessage());

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(response);
                }
        }

        /**
         * Descargar mi horario a pdf
         */
        @GetMapping("/my-schedule/pdf")
        public ResponseEntity<byte[]> downloadMySchedulePdf(
                @RequestAttribute("idUser") Integer idUser,
                @RequestAttribute("role") String role) {

        try {

                List<ScheduleResponseDTO> schedules =
                        service.getMySchedule(idUser, role);

                SchedulePdfDTO pdfData = new SchedulePdfDTO();

                // Fecha de generación
                pdfData.setFechaGeneracion(
                        LocalDate.now().format(
                                DateTimeFormatter.ofPattern("dd/MM/yyyy")
                        )
                );

                // Información específica del usuario
                if ("ESTUDIANTE".equals(role)) {

                Integer idCourse =
                        administracionServiceClient.getUserCourse(idUser);

                if (idCourse != null) {

                        Course course =
                                service.getCourseById(idCourse);

                        // Curso
                        pdfData.setCurso(course.getName());

                        // Periodo académico
                        Integer idPeriod = course.getIdPeriod();

                        AcademicPeriod period =
                                service.getAcademicPeriodById(idPeriod);

                        pdfData.setPeriodo(period.getName());
                }

                // Estudiante
                pdfData.setEstudiante(
                        administracionServiceClient
                                .getUserFullName(idUser)
                );
                }

                byte[] pdf =
                        pdfService.generateSchedulePdf(
                                pdfData,
                                schedules
                        );

                return ResponseEntity.ok()
                        .header(
                                HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=mi-horario.pdf"
                        )
                        .contentType(MediaType.APPLICATION_PDF)
                        .body(pdf);

        } catch (IllegalArgumentException e) {

                return ResponseEntity.badRequest().build();

        } catch (Exception e) {

        e.printStackTrace();

        return ResponseEntity.internalServerError().build();
        }
        }
}

