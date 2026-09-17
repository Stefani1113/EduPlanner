package eduPlanner.ed_ms_configuracion_institucional.controller;

import com.eduplanner.ed_lib_common.dto.ColorsUpdateRequest;
import com.eduplanner.ed_lib_common.dto.ConfigurationResponse;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.dto.InstitutionInfoUpdateRequest;
import com.eduplanner.ed_lib_common.enums.RolEnum;

import eduPlanner.ed_ms_configuracion_institucional.security.RequireRole;
import eduPlanner.ed_ms_configuracion_institucional.service.InstitutionConfigurationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * RF 10 / RF 10.1 / RF 10.7: configuración institucional (nombre, logo,
 * descripción y los 5 colores editables). La lectura (GET) es pública
 * para poder pintar el tema en toda la app, incluida la pantalla de login;
 * la escritura exige rol ADMINISTRADOR.
 */
@RestController
@RequestMapping("/configuration")
@RequiredArgsConstructor
public class InstitutionConfigurationController {

    private final InstitutionConfigurationService service;

    /**
     * RF 10.4 / RF 10.6: se lee al iniciar sesión y debe reflejar los
     * cambios del administrador sin quedar cacheada por el navegador,
     * de modo que una recarga (o polling del frontend) siempre traiga
     * el tema vigente.
     */
    @GetMapping
    public ResponseEntity<HttpGlobalResponse<ConfigurationResponse>> getConfiguration() {
        HttpGlobalResponse<ConfigurationResponse> response = new HttpGlobalResponse<>();
        response.setData(service.getConfiguration());
        response.setMessage("Configuración institucional consultada correctamente");
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(response);
    }

    @RequireRole(RolEnum.ADMINISTRADOR)
    @PutMapping("/info")
    public ResponseEntity<HttpGlobalResponse<ConfigurationResponse>> updateInfo(
            @Valid @RequestBody InstitutionInfoUpdateRequest request) {
        return ok(service.updateInfo(request), "Información institucional actualizada correctamente");
    }

    @RequireRole(RolEnum.ADMINISTRADOR)
    @PutMapping("/colors")
    public ResponseEntity<HttpGlobalResponse<ConfigurationResponse>> updateColors(
            @Valid @RequestBody ColorsUpdateRequest request) {
        return ok(service.updateColors(request), "Paleta de colores actualizada correctamente");
    }

    @RequireRole(RolEnum.ADMINISTRADOR)
    @PostMapping("/colors/reset")
    public ResponseEntity<HttpGlobalResponse<ConfigurationResponse>> resetColors() {
        return ok(service.resetColorsToDefault(), "Paleta de colores restablecida a los valores por defecto");
    }

    @RequireRole(RolEnum.ADMINISTRADOR)
    @PostMapping(value = "/logo", consumes = "multipart/form-data")
    public ResponseEntity<HttpGlobalResponse<ConfigurationResponse>> uploadLogo(
            @RequestParam("file") MultipartFile file) {
        return ok(service.uploadLogo(file), "Logo institucional actualizado correctamente");
    }

    @RequireRole(RolEnum.ADMINISTRADOR)
    @DeleteMapping("/logo")
    public ResponseEntity<HttpGlobalResponse<ConfigurationResponse>> removeLogo() {
        return ok(service.removeLogo(), "Logo institucional eliminado correctamente");
    }

    private ResponseEntity<HttpGlobalResponse<ConfigurationResponse>> ok(ConfigurationResponse data, String message) {
        HttpGlobalResponse<ConfigurationResponse> response = new HttpGlobalResponse<>();
        response.setData(data);
        response.setMessage(message);
        return ResponseEntity.ok(response);
    }
}
