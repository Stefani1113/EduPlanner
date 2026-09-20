package eduPlanner.ed_ms_configuracion_institucional.exception;

/**
 * Se lanza ante violaciones de reglas de negocio (archivo inválido,
 * tipo de imagen no soportado, error al subir a Cloudinary, etc.).
 * El GlobalExceptionHandler la traduce a 400.
 */
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}
