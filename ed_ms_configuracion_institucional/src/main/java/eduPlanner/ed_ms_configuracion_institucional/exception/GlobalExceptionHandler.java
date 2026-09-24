package eduPlanner.ed_ms_configuracion_institucional.exception;

import com.eduplanner.ed_lib_common.dto.ApiErrorResponse;
import com.eduplanner.ed_lib_common.dto.ColorsUpdateRequest;

import jakarta.servlet.http.HttpServletRequest;

import lombok.extern.log4j.Log4j2;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Traduce las excepciones del microservicio a respuestas {@link ApiErrorResponse}
 * consistentes. En particular, cuando falla la validación de
 * {@link ColorsUpdateRequest} (RF 10 / RF 10.1), devuelve el mensaje de
 * negocio exigido: "Debe seleccionar los 5 colores para completar la
 * personalización", con el detalle de cada color faltante o inválido.
 */
@RestControllerAdvice
@Log4j2
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex,
                                                               HttpServletRequest request) {
        List<String> details = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .toList();

        boolean isColorsRequest = ex.getBindingResult().getTarget() instanceof ColorsUpdateRequest;
        String message = isColorsRequest
                ? "Debe seleccionar los 5 colores para completar la personalización"
                : "Error de validación en los datos enviados";

        return build(HttpStatus.BAD_REQUEST, message, details, request);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), null, request);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusiness(BusinessException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), null, request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException ex,
                                                                    HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), null, request);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorResponse> handleConflict(IllegalStateException ex, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), null, request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex,
                                                                  HttpServletRequest request) {
        log.warn("Violación de integridad de datos en {}: {}", request.getRequestURI(), ex.getMessage());
        return build(HttpStatus.CONFLICT,
                "La operación viola una restricción de la base de datos (posición u orden duplicado)", null, request);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleMaxUploadSize(MaxUploadSizeExceededException ex,
                                                                  HttpServletRequest request) {
        return build(HttpStatus.PAYLOAD_TOO_LARGE, "El archivo supera el tamaño máximo permitido", null, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
        log.error("Error inesperado en {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error inesperado. Intenta nuevamente.", null, request);
    }

    private ResponseEntity<ApiErrorResponse> build(HttpStatus status, String message, List<String> details,
                                                     HttpServletRequest request) {
        ApiErrorResponse body = ApiErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .details(details)
                .build();
        return ResponseEntity.status(status).body(body);
    }
}
