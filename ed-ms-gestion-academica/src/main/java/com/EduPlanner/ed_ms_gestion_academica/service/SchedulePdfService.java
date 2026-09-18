package com.EduPlanner.ed_ms_gestion_academica.service;

import com.eduplanner.ed_lib_common.dto.SchedulePdfDTO;
import com.eduplanner.ed_lib_common.dto.SchedulePdfRowDTO;
import com.eduplanner.ed_lib_common.dto.ScheduleResponseDTO;
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

    public byte[] generateSchedulePdf(SchedulePdfDTO data,List<ScheduleResponseDTO> schedules) {
        data.setFilas(buildRows(schedules));

        return generatePdf(data);
    }

    private List<SchedulePdfRowDTO> buildRows(List<ScheduleResponseDTO> schedules) {

    Map<Short, SchedulePdfRowDTO> rows = new LinkedHashMap<>();

    schedules.stream()
            .sorted(Comparator.comparing(
                    ScheduleResponseDTO::getSlotOrder,
                    Comparator.nullsLast(Comparator.naturalOrder())
            ))
            .forEach(schedule -> {

                Short slotOrder = schedule.getSlotOrder();

                SchedulePdfRowDTO row = rows.computeIfAbsent(
                        slotOrder,
                        key -> {

                            SchedulePdfRowDTO newRow =
                                    new SchedulePdfRowDTO();

                            newRow.setHoraInicio(
                                    schedule.getStartTime().toString()
                            );

                            newRow.setHoraFin(
                                    schedule.getEndTime().toString()
                            );

                            return newRow;
                        }
                );

                String subject = schedule.getSubjectName();

                switch (schedule.getDayOfWeek()) {

                    case 1 -> row.setLunes(subject);

                    case 2 -> row.setMartes(subject);

                    case 3 -> row.setMiercoles(subject);

                    case 4 -> row.setJueves(subject);

                    case 5 -> row.setViernes(subject);

                    default -> {
                        // No hacemos nada para días no contemplados
                    }
                }
            });

        return new ArrayList<>(rows.values());
    }
}