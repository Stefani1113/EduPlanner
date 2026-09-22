package EduPlanner.ed_ms_notas.service;

import com.eduplanner.ed_lib_common.dto.GradeResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class GradePdfService {

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final TemplateEngine templateEngine;

    /**
     * Genera el PDF del reporte de notas.
     */
    public byte[] generatePdf(
            String title,
            String subtitle,
            List<GradeResponseDTO> records
    ) {

        try {

            if (records == null) {
                records = List.of();
            }

            // =====================================================
            // DATOS PARA LA PLANTILLA
            // =====================================================

            long totalRegistros = records.size();

            long totalAprobadas = records.stream()
                    .filter(g -> g.getGradeValue() != null)
                    .count();

            long totalSinRegistro = records.stream()
                    .filter(g -> g.getGradeValue() == null)
                    .count();

            // =====================================================
            // CONTEXTO THYMELEAF
            // =====================================================

            Context context = new Context();

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
            // CONSUMIR PLANTILLA
            // =====================================================

            String html = templateEngine.process(
                    "grade-report",
                    context
            );

            // =====================================================
            // HTML → PDF
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

        // AQUÍ VA EL CONVERSOR HTML → PDF
        // que ya tengas configurado en el proyecto.

        return null;
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