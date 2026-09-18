package eduPlanner.ed_ms_configuracion_institucional.controller;

import com.eduplanner.ed_lib_common.dto.CarouselImageResponse;
import com.eduplanner.ed_lib_common.dto.CarouselReorderRequest;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.enums.RolEnum;

import eduPlanner.ed_ms_configuracion_institucional.security.RequireRole;
import eduPlanner.ed_ms_configuracion_institucional.service.CarouselImageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * RF 10: imágenes del carrusel institucional (máx. configurable, por
 * defecto 5). La lectura (GET) es pública; escribir exige ADMINISTRADOR.
 */
@RestController
@RequestMapping("/configuration/carousel")
@RequiredArgsConstructor
public class CarouselImageController {

    private final CarouselImageService service;

    @GetMapping
    public ResponseEntity<HttpGlobalResponse<List<CarouselImageResponse>>> listImages() {
        return ok(service.listImages(), "Imágenes del carrusel consultadas correctamente");
    }

    @RequireRole(RolEnum.ADMINISTRADOR)
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<HttpGlobalResponse<CarouselImageResponse>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "order", required = false) Integer order) {

        HttpGlobalResponse<CarouselImageResponse> response = new HttpGlobalResponse<>();
        response.setData(service.uploadImage(file, order));
        response.setMessage("Imagen agregada al carrusel correctamente");
        return ResponseEntity.ok(response);
    }

    @RequireRole(RolEnum.ADMINISTRADOR)
    @DeleteMapping("/{idImage}")
    public ResponseEntity<HttpGlobalResponse<Void>> deleteImage(@PathVariable Integer idImage) {
        service.deleteImage(idImage);
        HttpGlobalResponse<Void> response = new HttpGlobalResponse<>();
        response.setMessage("Imagen del carrusel eliminada correctamente");
        return ResponseEntity.ok(response);
    }

    @RequireRole(RolEnum.ADMINISTRADOR)
    @PutMapping("/reorder")
    public ResponseEntity<HttpGlobalResponse<List<CarouselImageResponse>>> reorder(
            @Valid @RequestBody CarouselReorderRequest request) {
        return ok(service.reorder(request), "Orden del carrusel actualizado correctamente");
    }

    private ResponseEntity<HttpGlobalResponse<List<CarouselImageResponse>>> ok(
            List<CarouselImageResponse> data, String message) {
        HttpGlobalResponse<List<CarouselImageResponse>> response = new HttpGlobalResponse<>();
        response.setData(data);
        response.setMessage(message);
        return ResponseEntity.ok(response);
    }
}
