package com.EduPlanner.ed_ms_gestion_academica.service;

import com.eduplanner.ed_lib_common.dto.AttendanceResponseDTO;
import com.eduplanner.ed_lib_common.dto.AttendanceSummaryDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class AttendancePdfService {

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final TemplateEngine templateEngine;

    /**
     * Generar PDF de asistencias
     */
    public byte[] generatePdf(
            String title,
            String subtitle,
            List<AttendanceResponseDTO> records,
            AttendanceSummaryDTO summary) {

        try {

            Context context = new Context();

            context.setVariable("title", title);
            context.setVariable("subtitle", subtitle);
            context.setVariable("fechaGeneracion",
                    LocalDate.now().format(DATE_FMT));

            context.setVariable(
                    "records",
                    records != null ? records : List.of()
            );

            context.setVariable("summary", summary);


            String html = templateEngine.process(
                    "pdf/attendance",
                    context
            );

            log.info("===== INICIANDO GENERACIÓN PDF ASISTENCIAS =====");


            try (ByteArrayOutputStream outputStream =
                        new ByteArrayOutputStream()) {

                PdfRendererBuilder builder =
                        new PdfRendererBuilder();

                builder.useFastMode();

                builder.withHtmlContent(
                        html,
                        ""
                );

                builder.toStream(outputStream);

                builder.run();

                byte[] pdf = outputStream.toByteArray();

                log.info(
                        "PDF de asistencias generado correctamente. Tamaño: {} bytes",
                        pdf.length
                );

                return pdf;
            }

        } catch (Exception e) {

            log.error(
                    "Error generando PDF de asistencias",
                    e
            );

            throw new RuntimeException(
                    "No se pudo generar el PDF de asistencias",
                    e
            );
        }
    }

    /**
     * Construir nombre del archivo
     */
    public String buildFileName(
            String prefix,
            Integer id,
            LocalDate startDate,
            LocalDate endDate) {

        return prefix
                + "_"
                + id
                + "_"
                + startDate
                + "_a_"
                + endDate
                + ".pdf";
    }
}