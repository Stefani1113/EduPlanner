package EduPlanner.ed_ms_notas.client;

import com.eduplanner.ed_lib_common.dto.UserResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Cliente Feign declarativo hacia ed-ms-administracion.
 * Reemplaza las llamadas manuales por RestTemplate por una interfaz de Feign.
 */
@FeignClient(name = "administracion-service", url = "${services.administracion.base-url}")
public interface AdministracionFeignClient {

    /** Devuelve el usuario completo (incluye name, surnames y roleName). 404 si no existe. */
    @GetMapping("/internal/users/{idUser}")
    UserResponseDTO getUser(@PathVariable("idUser") Integer idUser);
}
