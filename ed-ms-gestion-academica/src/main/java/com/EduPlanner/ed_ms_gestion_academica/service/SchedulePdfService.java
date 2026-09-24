package com.EduPlanner.ed_ms_gestion_academica.service;

import com.eduplanner.ed_lib_common.dto.SchedulePdfDTO;
import com.eduplanner.ed_lib_common.dto.SchedulePdfRowDTO;
import com.eduplanner.ed_lib_common.dto.ScheduleResponseDTO;
import com.eduplanner.ed_lib_common.dto.TimeSlotResponseDTO;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SchedulePdfService {

    private final TemplateEngine templateEngine;


    public byte[] generatePdf(SchedulePdfDTO data) {

        // Crear el contexto de Thymeleaf
        Context context = new Context();

        context.setVariable("fechaGeneracion", data.getFechaGeneracion());
        context.setVariable("curso", data.getCurso());
        context.setVariable("periodo", data.getPeriodo());
        context.setVariable("docente", data.getDocente());
        context.setVariable("estudiante", data.getEstudiante());
        context.setVariable("filas", data.getFilas());
        context.setVariable("anio", data.getFechaGeneracion().substring(6));

        // Procesar la plantilla HTML
        String html = templateEngine.process(
                "pdf/schedule",
                context
        );

        // Convertir HTML a PDF
        try (ByteArrayOutputStream outputStream =
                    new ByteArrayOutputStream()) {

            PdfRendererBuilder builder = new PdfRendererBuilder();

            builder.useFastMode();

            builder.withHtmlContent(html, "");

            builder.toStream(outputStream);

            builder.run();

            return outputStream.toByteArray();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Error al generar el PDF del horario",
                    e
            );
        }
    }

    
    public byte[] generateSchedulePdf(
            SchedulePdfDTO data,
            List<ScheduleResponseDTO> schedules,
            List<TimeSlotResponseDTO> timeSlots
    ) {

        data.setFilas(buildRows(schedules, timeSlots));

        return generatePdf(data);
    }

    private List<SchedulePdfRowDTO> buildRows(
            List<ScheduleResponseDTO> schedules,
            List<TimeSlotResponseDTO> timeSlots
    ) {

        Map<Short, SchedulePdfRowDTO> rows =
                new LinkedHashMap<>();

        timeSlots.stream()
                .filter(slot -> Boolean.TRUE.equals(slot.getStatus()))
                .sorted(
                        Comparator.comparing(
                                TimeSlotResponseDTO::getSlotOrder
                        )
                )
                .forEach(timeSlot -> {

                    SchedulePdfRowDTO row =
                            new SchedulePdfRowDTO();

                    row.setHoraInicio(
                            timeSlot.getStartTime().toString()
                    );

                    row.setHoraFin(
                            timeSlot.getEndTime().toString()
                    );

                    // Si el bloque es descanso
                    if (Boolean.TRUE.equals(timeSlot.getIsBreak())) {

                        row.setLunes("DESCANSO");
                        row.setMartes("DESCANSO");
                        row.setMiercoles("DESCANSO");
                        row.setJueves("DESCANSO");
                        row.setViernes("DESCANSO");
                    }

                    rows.put(
                            timeSlot.getSlotOrder(),
                            row
                    );
                });

        if (schedules != null) {

            schedules.stream()
                    .sorted(
                            Comparator.comparing(
                                    ScheduleResponseDTO::getSlotOrder,
                                    Comparator.nullsLast(
                                            Comparator.naturalOrder()
                                    )
                            )
                    )
                    .forEach(schedule -> {

                        Short slotOrder =
                                schedule.getSlotOrder();

                        SchedulePdfRowDTO row =
                                rows.get(slotOrder);

                        if (row == null) {

                            row = new SchedulePdfRowDTO();

                            if (schedule.getStartTime() != null) {
                                row.setHoraInicio(
                                        schedule.getStartTime().toString()
                                );
                            }

                            if (schedule.getEndTime() != null) {
                                row.setHoraFin(
                                        schedule.getEndTime().toString()
                                );
                            }

                            rows.put(slotOrder, row);
                        }

                        String subject =
                                schedule.getSubjectName();

                        if (subject == null || subject.isBlank()) {
                            return;
                        }

                        switch (schedule.getDayOfWeek()) {

                            case 1 ->
                                    row.setLunes(subject);

                            case 2 ->
                                    row.setMartes(subject);

                            case 3 ->
                                    row.setMiercoles(subject);

                            case 4 ->
                                    row.setJueves(subject);

                            case 5 ->
                                    row.setViernes(subject);

                            default -> {
                            }
                        }
                    });
        }

        return new ArrayList<>(rows.values());
    }
}