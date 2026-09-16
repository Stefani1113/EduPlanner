package eduPlanner.ed_ms_configuracion_institucional.controller;

import com.eduplanner.ed_lib_common.dto.ColorsUpdateRequest;
import com.eduplanner.ed_lib_common.dto.ConfigurationResponse;
import com.eduplanner.ed_lib_common.dto.InstitutionInfoUpdateRequest;
import eduPlanner.ed_ms_configuracion_institucional.service.InstitutionConfigurationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/institution/configuration")
@RequiredArgsConstructor
public class InstitutionConfigurationController {

    private final InstitutionConfigurationService configurationService;

    /** RF 10.4: lectura de la configuración al iniciar sesión / cargar la app. */
    @GetMapping
    public ResponseEntity<ConfigurationResponse> getConfiguration() {
        return ResponseEntity.ok(configurationService.getConfiguration());
    }

    /** RF 10 / RF 10.1: guardar los 5 colores institucionales. */
    @PutMapping("/colors")
    public ResponseEntity<ConfigurationResponse> updateColors(@Valid @RequestBody ColorsUpdateRequest request) {
        return ResponseEntity.ok(configurationService.updateColors(request));
    }

    /** Guardar nombre corto, nombre largo y descripción institucional. */
    @PutMapping("/info")
    public ResponseEntity<ConfigurationResponse> updateInfo(@Valid @RequestBody InstitutionInfoUpdateRequest request) {
        return ResponseEntity.ok(configurationService.updateInfo(request));
    }

    /** RF 10.2 / RF 10.2.2: cargar logo institucional (PNG/JPG/SVG, máx. 2MB). */
    @PostMapping(value = "/logo", consumes = "multipart/form-data")
    public ResponseEntity<ConfigurationResponse> updateLogo(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(configurationService.updateLogo(file));
    }

    /** RF 10.8: restablecer los 5 colores a los valores por defecto. */
    @PostMapping("/colors/reset")
    public ResponseEntity<ConfigurationResponse> resetColors() {
        return ResponseEntity.ok(configurationService.resetColorsToDefault());
    }
}
