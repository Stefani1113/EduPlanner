package EduPlanner.ed_ms_notas.client;

import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.dto.UserInfoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Comunicación con ed-ms-administracion vía Feign.
 * "name" debe coincidir EXACTO con spring.application.name de administracion,
 * que es el nombre con el que se registra en Consul. Sin "url": Consul resuelve la IP:puerto.
 */
@FeignClient(name = "ed-ms-administracion")
public interface AdministracionFeignClient {

    @GetMapping("/eduplanner/internal/users/{id}/role")
    String getUserRole(@PathVariable("id") Integer id);

    @GetMapping("/eduplanner/internal/users/{id}")
    HttpGlobalResponse<UserInfoDTO> getUserById(@PathVariable("id") Integer id);
}
