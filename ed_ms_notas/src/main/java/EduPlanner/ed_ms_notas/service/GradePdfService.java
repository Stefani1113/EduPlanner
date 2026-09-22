package EduPlanner.ed_ms_notas.service;

import com.eduplanner.ed_lib_common.dto.GradeResponseDTO;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * RF 9.4 - Generar y exportar reportes de notas en PDF.
 *
 * El contenido del PDF se construye mediante:
 *
 * Thymeleaf -> HTML
 * OpenHTMLToPDF -> PDF
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class GradePdfService {

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final TemplateEngine templateEngine;

    /**
     * Genera el reporte de notas en PDF.
     *
     * @param title título principal del reporte
     * @param subtitle subtítulo del reporte
     * @param records registros de notas
     * @return PDF en bytes
     */
    public byte[] generatePdf(
            String title,
            String subtitle,
            List<GradeResponseDTO> records
    ) {

        try {

            // =====================================================
            // 1. VALIDAR LISTA
            // =====================================================

            if (records == null) {
                records = List.of();
            }

            // =====================================================
            // 2. CALCULAR INFORMACIÓN DEL RESUMEN
            // =====================================================

            long totalRegistros = records.size();

            long totalAprobadas = records.stream()
                    .filter(g -> g.getGradeValue() != null)
                    .count();

            long totalSinRegistro = records.stream()
                    .filter(g -> g.getGradeValue() == null)
                    .count();

            // =====================================================
            // 3. CREAR CONTEXTO THYMELEAF
            // =====================================================

            Context context = new Context();

            /*
             * Estas variables corresponden exactamente
             * a las utilizadas en grade-report.html
             */

            context.setVariable("title", title);

            context.setVariable("subtitle", subtitle);

            context.setVariable(
                    "fechaGeneracion",
                    LocalDate.now().format(DATE_FMT)
            );

            context.setVariable(
                    "totalRegistros",
                    totalRegistros
            );

            context.setVariable(
                    "totalAprobadas",
                    totalAprobadas
            );

            context.setVariable(
                    "totalSinRegistro",
                    totalSinRegistro
            );

            context.setVariable(
                    "records",
                    records
            );

            // =====================================================
            // 4. PROCESAR PLANTILLA THYMELEAF
            // =====================================================

            /*
             * Thymeleaf buscará:
             *
             * src/main/resources/templates/grade-report.html
             *
             * y reemplazará todas las expresiones th:*.
             */

            records.forEach(g -> log.info(
                "========== DATOS PDF ==========\n" +
                "ID Grade: {}\n" +
                "Estudiante: {}\n" +
                "Curso: {}\n" +
                "Asignatura: {}\n" +
                "Periodo: {}\n" +
                "Tipo evaluación: {}\n" +
                "Nota: {}\n" +
                "Estado: {}\n" +
                "===============================",
                g.getIdGrade(),
                g.getStudentName(),
                g.getCourseName(),
                g.getSubjectName(),
                g.getPeriodName(),
                g.getIdEvaluationType(),
                g.getGradeValue(),
                g.getStatus()
        ));

            String html = templateEngine.process(
                    "grades-pdf",
                    context
            );

            // =====================================================
            // 5. CONVERTIR HTML A PDF
            // =====================================================

            return convertHtmlToPdf(html);

        } catch (Exception e) {

            log.error(
                    "Error generando PDF de notas",
                    e
            );

            throw new RuntimeException(
                    "No se pudo generar el PDF de notas",
                    e
            );
        }
    }

    /**
     * Convierte el HTML generado por Thymeleaf a PDF.
     */
    private byte[] convertHtmlToPdf(String html) {

        try (ByteArrayOutputStream outputStream =
                     new ByteArrayOutputStream()) {

            PdfRendererBuilder builder =
                    new PdfRendererBuilder();

            builder.useFastMode();

            builder.withHtmlContent(
                    html,
                    null
            );

            builder.toStream(outputStream);

            builder.run();

            return outputStream.toByteArray();

        } catch (Exception e) {

            log.error(
                    "Error convirtiendo HTML de notas a PDF",
                    e
            );

            throw new RuntimeException(
                    "No se pudo convertir el reporte HTML a PDF",
                    e
            );
        }
    }

    /**
     * Construye el nombre del archivo PDF.
     */
    public String buildFileName(
            String prefix,
            Integer id,
            Integer period
    ) {

        return prefix
                + "_"
                + id
                + "_periodo"
                + period
                + "_"
                + LocalDate.now()
                + ".pdf";
    }
}