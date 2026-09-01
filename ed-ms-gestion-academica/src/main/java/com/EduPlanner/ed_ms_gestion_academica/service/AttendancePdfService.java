package com.EduPlanner.ed_ms_gestion_academica.service;

import com.eduplanner.ed_lib_common.dto.AttendanceResponseDTO;
import com.eduplanner.ed_lib_common.dto.AttendanceSummaryDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;


import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/** - Generar PDF de asistencias / Descargar asistencia en PDF */
@Service
@RequiredArgsConstructor
@Log4j2
public class AttendancePdfService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final float MARGIN = 40f;
    private static final float ROW_HEIGHT = 18f;
    private static final float[] COL_WIDTHS = {70, 55, 60, 90, 90, 90}; // fecha, estado, id_estudiante/curso, observación, justificación, revisión

    /**
     * Genera un PDF con el listado de asistencias y, si se provee, un bloque de resumen arriba."
     */
    public byte[] generatePdf(String title, String subtitle, List<AttendanceResponseDTO> records, AttendanceSummaryDTO summary) {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            PDPageContentStream content = new PDPageContentStream(document, page);

            float pageWidth = page.getMediaBox().getWidth();
            float y = page.getMediaBox().getHeight() - MARGIN;

            // Título
            content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 16);
            content.beginText();
            content.newLineAtOffset(MARGIN, y);
            content.showText(title);
            content.endText();
            y -= 20;

            content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
            content.beginText();
            content.newLineAtOffset(MARGIN, y);
            content.showText(subtitle);
            content.endText();
            y -= 25;

            // Resumen (si viene, combinado con el PDF)
            if (summary != null) {
                content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 11);
                content.beginText();
                content.newLineAtOffset(MARGIN, y);
                content.showText("Resumen del periodo");
                content.endText();
                y -= 16;

                content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                String[] summaryLines = {
                        "Total de registros: " + summary.getTotalRecords(),
                        "Porcentaje de asistencia: " + summary.getAttendancePercentage() + "%",
                        "Presentes: " + summary.getPresentCount() + "   Tardanzas: " + summary.getLateCount()
                                + "   Salidas anticipadas: " + summary.getEarlyDepartureCount(),
                        "Ausencias justificadas: " + summary.getJustifiedAbsenceCount()
                                + "   Ausencias no justificadas: " + summary.getUnjustifiedAbsenceCount()
                };
                for (String line : summaryLines) {
                    content.beginText();
                    content.newLineAtOffset(MARGIN, y);
                    content.showText(line);
                    content.endText();
                    y -= 14;
                }
                y -= 15;
            }

            // Encabezado de la tabla
            String[] headers = {"Fecha", "Estado", "Curso", "Observación", "Justificación", "Revisión"};
            content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 9);
            float x = MARGIN;
            for (int i = 0; i < headers.length; i++) {
                content.beginText();
                content.newLineAtOffset(x, y);
                content.showText(headers[i]);
                content.endText();
                x += COL_WIDTHS[i];
            }
            y -= 6;
            content.moveTo(MARGIN, y);
            content.lineTo(pageWidth - MARGIN, y);
            content.stroke();
            y -= ROW_HEIGHT;

            // Filas
            content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 8);
            for (AttendanceResponseDTO r : records) {
                if (y < MARGIN + ROW_HEIGHT) {
                    content.close();
                    PDPage newPage = new PDPage(PDRectangle.A4);
                    document.addPage(newPage);
                    content = new PDPageContentStream(document, newPage);
                    content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 8);
                    y = newPage.getMediaBox().getHeight() - MARGIN;
                }

                x = MARGIN;
                String[] row = {
                        r.getAttendanceDate() != null ? r.getAttendanceDate().format(DATE_FMT) : "",
                        r.getAttendanceStatus() != null ? r.getAttendanceStatus().name() : "",
                        r.getIdCourse() != null ? String.valueOf(r.getIdCourse()) : "",
                        truncate(r.getObservation(), 20),
                        truncate(r.getJustificationText(), 20),
                        r.getJustificationStatus() != null ? r.getJustificationStatus().name() : ""
                };
                for (int i = 0; i < row.length; i++) {
                    content.beginText();
                    content.newLineAtOffset(x, y);
                    content.showText(row[i]);
                    content.endText();
                    x += COL_WIDTHS[i];
                }
                y -= ROW_HEIGHT;
            }

            if (records.isEmpty()) {
                content.beginText();
                content.newLineAtOffset(MARGIN, y);
                content.showText("No se encontraron registros de asistencia en el periodo indicado.");
                content.endText();
            }

            content.close();

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            log.error("Error generando PDF de asistencias", e);
            throw new RuntimeException("No se pudo generar el PDF de asistencias");
        }
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() <= maxLength ? text : text.substring(0, maxLength - 1) + "…";
    }

    public String buildFileName(String prefix, Integer id, LocalDate startDate, LocalDate endDate) {
        return prefix + "_" + id + "_" + startDate + "_a_" + endDate + ".pdf";
    }
}
