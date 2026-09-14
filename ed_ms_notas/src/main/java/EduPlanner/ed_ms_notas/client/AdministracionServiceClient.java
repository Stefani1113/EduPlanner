package EduPlanner.ed_ms_notas.client;

import com.eduplanner.ed_lib_common.dto.UserResponseDTO;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** Le pregunta a ed-ms-administracion (vía Feign) si un idUser existe, qué rol tiene y su nombre. */
@Component
@RequiredArgsConstructor
public class AdministracionServiceClient {

    private final AdministracionFeignClient feignClient;

    /** Devuelve el nombre del rol del usuario, o null si no existe. */
    public String getUserRole(Integer idUser) {
        UserResponseDTO user = getUser(idUser);
        return user != null ? user.getRoleName() : null;
    }

    /** Devuelve el nombre completo (nombre + apellidos) del usuario, o null si no existe. */
    public String getUserName(Integer idUser) {
        UserResponseDTO user = getUser(idUser);
        if (user == null) {
            return null;
        }
        return (user.getName() + " " + user.getSurnames()).trim();
    }

    private UserResponseDTO getUser(Integer idUser) {
        try {
            return feignClient.getUser(idUser);
        } catch (FeignException.NotFound e) {
            return null;
        }
    }
}
