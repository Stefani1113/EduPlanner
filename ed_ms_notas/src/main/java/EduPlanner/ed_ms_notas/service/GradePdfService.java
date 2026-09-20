package EduPlanner.ed_ms_notas.service;

import com.eduplanner.ed_lib_common.dto.GradeResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/** RF 9.4 - Generar y exportar reportes de notas en PDF */
@Service
@RequiredArgsConstructor
@Log4j2
public class GradePdfService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final Color COLOR_PRIMARY = new Color(30, 64, 175);
    private static final Color COLOR_PRIMARY_LIGHT = new Color(219, 234, 254);
    private static final Color COLOR_TABLE_HEADER = new Color(30, 41, 59);
    private static final Color COLOR_ROW_ALT = new Color(243, 246, 250);
    private static final Color COLOR_TEXT_DARK = new Color(30, 41, 59);
    private static final Color COLOR_TEXT_MUTED = new Color(100, 116, 139);
    private static final Color COLOR_WHITE = Color.WHITE;
    private static final Color COLOR_PASS = new Color(22, 163, 74);
    private static final Color COLOR_FAIL = new Color(220, 38, 38);

    private static final float MARGIN = 40f;
    private static final float ROW_HEIGHT = 20f;
    // Tamaño A4 en horizontal (apaisado): ancho y alto invertidos
    private static final PDRectangle A4_LANDSCAPE =
            new PDRectangle(PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth());
    // estudiante, curso, asignatura, periodo, actividad/tipo, nota, estado
    private static final float[] COL_WIDTHS = {110, 55, 90, 55, 55, 45, 65};

    private final PDFont fontRegular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
    private final PDFont fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

    private static String traducirEstado(String status) {
        if (status == null) return "";
        return switch (status) {
            case "REGISTERED" -> "Registrada";
            case "MODIFIED" -> "Modificada";
            case "ANNULLED" -> "Anulada";
            default -> status;
        };
    }

    public byte[] generatePdf(String title, String subtitle, List<GradeResponseDTO> records) {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(A4_LANDSCAPE);
            document.addPage(page);
            float pageWidth = page.getMediaBox().getWidth();
            PDPageContentStream content = new PDPageContentStream(document, page);

            float y = page.getMediaBox().getHeight();

            float bannerHeight = 55f;
            fillRect(content, 0, y - bannerHeight, pageWidth, bannerHeight, COLOR_PRIMARY);
            content.setNonStrokingColor(COLOR_WHITE);
            text(content, fontBold, 17, MARGIN, y - 28, title);
            text(content, fontRegular, 10, MARGIN, y - 44, subtitle);
            y -= bannerHeight + 20;

            long total = records.size();
            long approved = records.stream()
                    .filter(g -> "REGISTERED".equals(g.getStatus()) || "MODIFIED".equals(g.getStatus()))
                    .count();

            float boxHeight = 40f;
            fillRect(content, MARGIN, y - boxHeight, pageWidth - 2 * MARGIN, boxHeight, COLOR_PRIMARY_LIGHT);
            content.setNonStrokingColor(COLOR_TEXT_DARK);
            text(content, fontRegular, 9, MARGIN + 14, y - 24, "Total de notas registradas: " + total);
            y -= boxHeight + 20;

            String[] headers = {"Estudiante", "Curso", "Asignatura", "Periodo", "Tipo eval.", "Nota", "Estado"};
            fillRect(content, MARGIN, y - ROW_HEIGHT, pageWidth - 2 * MARGIN, ROW_HEIGHT, COLOR_TABLE_HEADER);
            content.setNonStrokingColor(COLOR_WHITE);
            float x = MARGIN + 6;
            for (int i = 0; i < headers.length; i++) {
                text(content, fontBold, 9, x, y - 14, headers[i]);
                x += COL_WIDTHS[i];
            }
            y -= ROW_HEIGHT;

            boolean alt = false;
            for (GradeResponseDTO g : records) {
                if (y < MARGIN + ROW_HEIGHT) {
                    content.close();
                    PDPage newPage = new PDPage(A4_LANDSCAPE);
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

                text(content, fontRegular, 8, x, baseline, truncate(g.getStudentName(), 20));
                x += COL_WIDTHS[0];

                text(content, fontRegular, 8, x, baseline, truncate(g.getCourseName(), 10));
                x += COL_WIDTHS[1];

                text(content, fontRegular, 8, x, baseline, truncate(g.getSubjectName(), 16));
                x += COL_WIDTHS[2];

                text(content, fontRegular, 8, x, baseline, truncate(g.getPeriodName(), 10));
                x += COL_WIDTHS[3];

                text(content, fontRegular, 8, x, baseline, g.getIdEvaluationType() != null ? "#" + g.getIdEvaluationType() : "");
                x += COL_WIDTHS[4];

                boolean approvedRow = g.getGradeValue() != null;
                content.setNonStrokingColor(approvedRow ? COLOR_PASS : COLOR_TEXT_MUTED);
                text(content, fontBold, 9, x, baseline, g.getGradeValue() != null ? g.getGradeValue().toString() : "");
                x += COL_WIDTHS[5];

                content.setNonStrokingColor(COLOR_TEXT_DARK);
                text(content, fontRegular, 8, x, baseline, traducirEstado(g.getStatus()));

                y -= ROW_HEIGHT;
            }

            if (records.isEmpty()) {
                content.setNonStrokingColor(COLOR_TEXT_MUTED);
                text(content, fontRegular, 10, MARGIN, y - 20, "No se encontraron notas registradas en el periodo indicado.");
            }

            content.close();

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            log.error("Error generando PDF de notas", e);
            throw new RuntimeException("No se pudo generar el PDF de notas");
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

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() <= maxLength ? text : text.substring(0, maxLength - 1) + "…";
    }

    public String buildFileName(String prefix, Integer id, Integer period) {
        return prefix + "_" + id + "_periodo" + period + "_" + LocalDate.now() + ".pdf";
    }
}
