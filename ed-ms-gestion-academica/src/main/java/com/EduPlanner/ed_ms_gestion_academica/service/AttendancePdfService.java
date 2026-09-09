package com.EduPlanner.ed_ms_gestion_academica.service;

import com.eduplanner.ed_lib_common.dto.AttendanceResponseDTO;
import com.eduplanner.ed_lib_common.dto.AttendanceSummaryDTO;
import com.eduplanner.ed_lib_common.enums.AttendanceStatus;
import com.eduplanner.ed_lib_common.enums.JustificationStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/** Generar PDF de asistencias / Descargar asistencia en PDF */
@Service
@RequiredArgsConstructor
@Log4j2
public class AttendancePdfService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // ---- Paleta de colores ----
    private static final Color COLOR_PRIMARY = new Color(30, 64, 175);      // banner del título
    private static final Color COLOR_PRIMARY_LIGHT = new Color(219, 234, 254); // fondo del bloque resumen
    private static final Color COLOR_TABLE_HEADER = new Color(30, 41, 59);  // encabezado de la tabla
    private static final Color COLOR_ROW_ALT = new Color(243, 246, 250);    // filas pares
    private static final Color COLOR_TEXT_DARK = new Color(30, 41, 59);
    private static final Color COLOR_TEXT_MUTED = new Color(100, 116, 139);
    private static final Color COLOR_WHITE = Color.WHITE;

    // Colores por estado de asistencia
    private static final Map<AttendanceStatus, Color> ATTENDANCE_COLORS = new EnumMap<>(AttendanceStatus.class);
    static {
        ATTENDANCE_COLORS.put(AttendanceStatus.PRESENT, new Color(22, 163, 74));
        ATTENDANCE_COLORS.put(AttendanceStatus.LATE, new Color(217, 119, 6));
        ATTENDANCE_COLORS.put(AttendanceStatus.EARLY_DEPARTURE, new Color(124, 58, 237));
        ATTENDANCE_COLORS.put(AttendanceStatus.ABSENT, new Color(220, 38, 38));
        ATTENDANCE_COLORS.put(AttendanceStatus.JUSTIFIED, new Color(8, 145, 178));
    }

    // Colores por estado de justificación
    private static final Map<JustificationStatus, Color> JUSTIFICATION_COLORS = new EnumMap<>(JustificationStatus.class);
    static {
        JUSTIFICATION_COLORS.put(JustificationStatus.NONE, new Color(148, 163, 184));
        JUSTIFICATION_COLORS.put(JustificationStatus.PENDING, new Color(217, 119, 6));
        JUSTIFICATION_COLORS.put(JustificationStatus.APPROVED, new Color(22, 163, 74));
        JUSTIFICATION_COLORS.put(JustificationStatus.REJECTED, new Color(220, 38, 38));
    }

    // Traducciones al español
    private static String traducir(AttendanceStatus status) {
        if (status == null) return "";
        return switch (status) {
            case PRESENT -> "Presente";
            case ABSENT -> "Ausente";
            case LATE -> "Tardanza";
            case EARLY_DEPARTURE -> "Salida anticipada";
            case JUSTIFIED -> "Justificado";
        };
    }

    private static String traducir(JustificationStatus status) {
        if (status == null) return "Sin justificar";
        return switch (status) {
            case NONE -> "Sin justificar";
            case PENDING -> "Pendiente";
            case APPROVED -> "Aprobada";
            case REJECTED -> "Rechazada";
        };
    }

    private static final float MARGIN = 40f;
    private static final float ROW_HEIGHT = 20f;
    // fecha, estado, curso, observación, justificación, revisión
    private static final float[] COL_WIDTHS = {62, 78, 35, 110, 110, 75};

    private final PDFont fontRegular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
    private final PDFont fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

    public byte[] generatePdf(String title, String subtitle, List<AttendanceResponseDTO> records, AttendanceSummaryDTO summary) {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            float pageWidth = page.getMediaBox().getWidth();
            PDPageContentStream content = new PDPageContentStream(document, page);

            float y = page.getMediaBox().getHeight();

            // ---- Banner del título ----
            float bannerHeight = summary != null ? 60f : 50f;
            fillRect(content, 0, y - bannerHeight, pageWidth, bannerHeight, COLOR_PRIMARY);

            content.setNonStrokingColor(COLOR_WHITE);
            text(content, fontBold, 17, MARGIN, y - 30, title);
            text(content, fontRegular, 10, MARGIN, y - 46, subtitle);

            y -= bannerHeight + 20;

            // ---- Bloque de resumen ----
            if (summary != null) {
                float boxHeight = 78f;
                fillRect(content, MARGIN, y - boxHeight, pageWidth - 2 * MARGIN, boxHeight, COLOR_PRIMARY_LIGHT);

                content.setNonStrokingColor(COLOR_TEXT_DARK);
                text(content, fontBold, 11, MARGIN + 14, y - 20, "Resumen del periodo");

                String pct = summary.getAttendancePercentage() + "%";
                content.setNonStrokingColor(COLOR_PRIMARY);
                text(content, fontBold, 26, pageWidth - MARGIN - 90, y - 34, pct);
                content.setNonStrokingColor(COLOR_TEXT_MUTED);
                text(content, fontRegular, 8, pageWidth - MARGIN - 90, y - 46, "asistencia en el periodo");

                content.setNonStrokingColor(COLOR_TEXT_DARK);
                float ly = y - 40;
                text(content, fontRegular, 9, MARGIN + 14, ly, "Total de registros: " + summary.getTotalRecords());
                ly -= 14;
                text(content, fontRegular, 9, MARGIN + 14, ly,
                        "Presentes: " + summary.getPresentCount()
                                + "    Tardanzas: " + summary.getLateCount()
                                + "    Salidas anticipadas: " + summary.getEarlyDepartureCount());
                ly -= 14;
                text(content, fontRegular, 9, MARGIN + 14, ly,
                        "Ausencias justificadas: " + summary.getJustifiedAbsenceCount()
                                + "    Ausencias no justificadas: " + summary.getUnjustifiedAbsenceCount());

                y -= boxHeight + 20;
            }

            // ---- Encabezado de la tabla ----
            String[] headers = {"Fecha", "Estado", "Curso", "Observación", "Justificación", "Revisión"};
            fillRect(content, MARGIN, y - ROW_HEIGHT, pageWidth - 2 * MARGIN, ROW_HEIGHT, COLOR_TABLE_HEADER);
            content.setNonStrokingColor(COLOR_WHITE);
            float x = MARGIN + 6;
            for (int i = 0; i < headers.length; i++) {
                text(content, fontBold, 9, x, y - 14, headers[i]);
                x += COL_WIDTHS[i];
            }
            y -= ROW_HEIGHT;

            // ---- Filas ----
            boolean alt = false;
            for (AttendanceResponseDTO r : records) {
                if (y < MARGIN + ROW_HEIGHT) {
                    content.close();
                    PDPage newPage = new PDPage(PDRectangle.A4);
                    document.addPage(newPage);
                    content = new PDPageContentStream(document, newPage);
                    y = newPage.getMediaBox().getHeight() - MARGIN;
                }

                if (alt) {
                    fillRect(content, MARGIN, y - ROW_HEIGHT, pageWidth - 2 * MARGIN, ROW_HEIGHT, COLOR_ROW_ALT);
                }
                alt = !alt;

                x = MARGIN + 6;
                float baseline = y - 14;

                content.setNonStrokingColor(COLOR_TEXT_DARK);
                text(content, fontRegular, 8, x, baseline,
                        r.getAttendanceDate() != null ? r.getAttendanceDate().format(DATE_FMT) : "");
                x += COL_WIDTHS[0];

                Color statusColor = ATTENDANCE_COLORS.getOrDefault(r.getAttendanceStatus(), COLOR_TEXT_MUTED);
                drawBadge(content, traducir(r.getAttendanceStatus()), x, y - ROW_HEIGHT + 3, COL_WIDTHS[1] - 8, 14, statusColor);
                x += COL_WIDTHS[1];

                content.setNonStrokingColor(COLOR_TEXT_DARK);
                text(content, fontRegular, 8, x, baseline, r.getIdCourse() != null ? String.valueOf(r.getIdCourse()) : "");
                x += COL_WIDTHS[2];

                text(content, fontRegular, 8, x, baseline, truncate(r.getObservation(), 22));
                x += COL_WIDTHS[3];

                text(content, fontRegular, 8, x, baseline, truncate(r.getJustificationText(), 22));
                x += COL_WIDTHS[4];

                Color justColor = JUSTIFICATION_COLORS.getOrDefault(r.getJustificationStatus(), COLOR_TEXT_MUTED);
                drawBadge(content, traducir(r.getJustificationStatus()), x, y - ROW_HEIGHT + 3, COL_WIDTHS[5] - 8, 14, justColor);

                y -= ROW_HEIGHT;
            }

            if (records.isEmpty()) {
                content.setNonStrokingColor(COLOR_TEXT_MUTED);
                text(content, fontRegular, 10, MARGIN, y - 20, "No se encontraron registros de asistencia en el periodo indicado.");
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

    private void fillRect(PDPageContentStream content, float x, float y, float width, float height, Color color) throws IOException {
        content.setNonStrokingColor(color);
        content.addRect(x, y, width, height);
        content.fill();
    }

    private void text(PDPageContentStream content, PDFont font, float size, float x, float y, String value) throws IOException {
        content.beginText();
        content.setFont(font, size);
        content.newLineAtOffset(x, y);
        content.showText(value == null ? "" : value);
        content.endText();
    }

    private void drawBadge(PDPageContentStream content, String label, float x, float y, float width, float height, Color color) throws IOException {
        fillRect(content, x, y, width, height, color);
        content.setNonStrokingColor(COLOR_WHITE);
        float fontSize = 7f;
        float textWidth = fontBold.getStringWidth(label) / 1000 * fontSize;
        float textX = x + Math.max(3, (width - textWidth) / 2);
        content.beginText();
        content.setFont(fontBold, fontSize);
        content.newLineAtOffset(textX, y + height / 2f - 2.5f);
        content.showText(label);
        content.endText();
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() <= maxLength ? text : text.substring(0, maxLength - 1) + "…";
    }

    public String buildFileName(String prefix, Integer id, LocalDate startDate, LocalDate endDate) {
        return prefix + "_" + id + "_" + startDate + "_a_" + endDate + ".pdf";
    }}
