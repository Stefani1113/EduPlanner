package EduPlanner.ed_ms_notas.client;

import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.dto.UserInfoDTO;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Envuelve al {@link AdministracionFeignClient} (comunicación vía Feign con
 * ed-ms-administracion) y expone operaciones de negocio listas para usar,
 * manejando los errores de red/HTTP en un solo lugar.
 */
@Component
@RequiredArgsConstructor
public class AdministracionServiceClient {

    private final AdministracionFeignClient feignClient;

    /** Devuelve el rol del usuario, o null si no existe. */
    public String getUserRole(Integer idUser) {
        try {
            return feignClient.getUserRole(idUser);
        } catch (FeignException.NotFound e) {
            return null;
        }
    }

    /** Devuelve la información básica del usuario (nombre, correo, rol), o null si no existe. */
    public UserInfoDTO getUserInfo(Integer idUser) {
        try {
            HttpGlobalResponse<UserInfoDTO> response = feignClient.getUserById(idUser);
            return response != null ? response.getData() : null;
        } catch (FeignException.NotFound e) {
            return null;
        }
    }

    /** Devuelve el nombre completo (nombre + apellidos) del usuario, o null si no existe. */
    public String getUserName(Integer idUser) {
        UserInfoDTO user = getUserInfo(idUser);
        if (user == null) {
            return null;
        }
        return ((user.getName() != null ? user.getName() : "")
                + " " + (user.getSurnames() != null ? user.getSurnames() : "")).trim();
    }

    /** Devuelve el correo del usuario, o null si no existe o no tiene correo registrado. */
    public String getUserEmail(Integer idUser) {
        UserInfoDTO user = getUserInfo(idUser);
        return user != null ? user.getEmail() : null;
    }
}
