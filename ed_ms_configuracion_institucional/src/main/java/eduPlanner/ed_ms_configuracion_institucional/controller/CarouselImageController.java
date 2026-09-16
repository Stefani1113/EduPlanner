package eduPlanner.ed_ms_configuracion_institucional.controller;

import com.eduplanner.ed_lib_common.dto.CarouselImageResponse;
import eduPlanner.ed_ms_configuracion_institucional.service.CarouselImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/institution/carousel")
@RequiredArgsConstructor
public class CarouselImageController {

    private final CarouselImageService carouselImageService;

    @GetMapping
    public ResponseEntity<List<CarouselImageResponse>> listImages() {
        return ResponseEntity.ok(carouselImageService.listImages());
    }

    /** Sube o reemplaza la imagen en la posición {imageOrder} (1..N). */
    @PostMapping(value = "/{imageOrder}", consumes = "multipart/form-data")
    public ResponseEntity<CarouselImageResponse> uploadImage(
            @PathVariable int imageOrder,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(carouselImageService.uploadImage(imageOrder, file));
    }

    @DeleteMapping("/{idImage}")
    public ResponseEntity<Void> deleteImage(@PathVariable Integer idImage) {
        carouselImageService.deleteImage(idImage);
        return ResponseEntity.noContent().build();
    }
}
