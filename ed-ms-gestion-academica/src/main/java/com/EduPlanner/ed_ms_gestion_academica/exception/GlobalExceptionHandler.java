package com.EduPlanner.ed_ms_gestion_academica.exception;

import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Traduce errores "crudos" de la base de datos (llaves foráneas que apuntan a un id
 * inexistente, valores duplicados, etc.) en mensajes claros para quien consume la API,
 * en vez de dejar pasar un 401/500 genérico sin explicación.
 *
 * Aplica a CUALQUIER controlador de este microservicio (curso, asistencia, carga
 * académica, horarios, etc.): no hay que repetir este manejo en cada uno.
 */
@RestControllerAdvice
@Log4j2
public class GlobalExceptionHandler {

    // Ej: FOREIGN KEY (`id_schedule`) REFERENCES `schedule` (`id_schedule`)
    private static final Pattern FK_PATTERN = Pattern.compile(
            "FOREIGN KEY \\(`(\\w+)`\\) REFERENCES `(\\w+)`");

    // Ej: Duplicate entry 'xyz' for key 'course.uk_name_period'
    private static final Pattern DUPLICATE_PATTERN = Pattern.compile(
            "Duplicate entry '(.+)' for key '([\\w.]+)'");

    // Nombre de tabla -> etiqueta legible en español (si no está aquí, se usa el nombre tal cual)
    private static final Map<String, String> TABLE_LABELS = Map.ofEntries(
            Map.entry("schedule", "horario"),
            Map.entry("course", "curso"),
            Map.entry("user", "usuario"),
            Map.entry("role", "rol"),
            Map.entry("academic_period", "periodo académico"),
            Map.entry("academic_level", "nivel académico"),
            Map.entry("school_shift", "jornada"),
            Map.entry("subject", "materia"),
            Map.entry("time_slot", "franja horaria"),
            Map.entry("academic_load", "carga académica"),
            Map.entry("teacher_availability", "disponibilidad del docente")
    );

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<HttpGlobalResponse<Object>> handleDataIntegrityViolation(DataIntegrityViolationException e) {
        String rawMessage = extractRootMessage(e);
        log.warn("Violación de integridad de datos: {}", rawMessage);

        HttpGlobalResponse<Object> r = new HttpGlobalResponse<>();

        Matcher fk = FK_PATTERN.matcher(rawMessage);
        if (fk.find()) {
            String column = fk.group(1);            // ej: id_schedule
            String referencedTable = fk.group(2);    // ej: schedule
            String fieldName = toCamelCase(column);  // ej: idSchedule
            String label = TABLE_LABELS.getOrDefault(referencedTable, referencedTable);
            r.setMessage("El " + fieldName + " indicado no existe (no se encontró en " + label + ")");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(r);
        }

        Matcher dup = DUPLICATE_PATTERN.matcher(rawMessage);
        if (dup.find()) {
            r.setMessage("Ya existe un registro con ese valor (" + dup.group(1) + ")");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(r);
        }

        r.setMessage("No se pudo completar la operación: revisa que los datos enviados sean válidos");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(r);
    }

    /** Baja hasta la causa más específica (la excepción real del driver JDBC) para leer su mensaje */
    private String extractRootMessage(DataIntegrityViolationException e) {
        Throwable cause = e.getMostSpecificCause();
        String message = cause != null ? cause.getMessage() : e.getMessage();
        return message != null ? message : "";
    }

    private String toCamelCase(String snakeCase) {
        String[] parts = snakeCase.split("_");
        StringBuilder sb = new StringBuilder(parts[0]);
        for (int i = 1; i < parts.length; i++) {
            if (!parts[i].isEmpty()) {
                sb.append(Character.toUpperCase(parts[i].charAt(0))).append(parts[i].substring(1));
            }
        }
        return sb.toString();
    }
}
