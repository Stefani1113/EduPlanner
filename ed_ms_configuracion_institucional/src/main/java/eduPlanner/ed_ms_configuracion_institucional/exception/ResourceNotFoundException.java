package eduPlanner.ed_ms_configuracion_institucional.exception;

/**
 * Se lanza cuando el recurso solicitado (configuración, imagen del
 * carrusel, etc.) no existe. El GlobalExceptionHandler la traduce a 404.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
