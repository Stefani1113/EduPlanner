package eduPlanner.ed_ms_notas.controller;

import com.eduplanner.ed_lib_common.dto.GradingScaleRequestDTO;
import com.eduplanner.ed_lib_common.dto.GradingScaleResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import eduPlanner.ed_ms_notas.service.GradingScaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** RF 9.1 - Configurar escala de calificación. Base: /eduplanner/grading-scales */
@RestController
@RequestMapping("/grading-scales")
@RequiredArgsConstructor
public class GradingScaleController {

    private final GradingScaleService service;

    @PostMapping
    public ResponseEntity<HttpGlobalResponse<GradingScaleResponseDTO>> register(
            @Valid @RequestBody GradingScaleRequestDTO req) {
        HttpGlobalResponse<GradingScaleResponseDTO> r = new HttpGlobalResponse<>();
        try {
            r.setData(service.register(req));
            r.setMessage("Escala de calificación registrada con éxito");
            return ResponseEntity.status(HttpStatus.CREATED).body(r);
        } catch (IllegalArgumentException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(r);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<GradingScaleResponseDTO>> update(
            @PathVariable Integer id, @Valid @RequestBody GradingScaleRequestDTO req) {
        HttpGlobalResponse<GradingScaleResponseDTO> r = new HttpGlobalResponse<>();
        try {
            r.setData(service.update(id, req));
            r.setMessage("Escala de calificación actualizada con éxito");
            return ResponseEntity.ok(r);
        } catch (IllegalArgumentException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(r);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<GradingScaleResponseDTO>> getById(@PathVariable Integer id) {
        HttpGlobalResponse<GradingScaleResponseDTO> r = new HttpGlobalResponse<>();
        try {
            r.setData(service.getById(id));
            r.setMessage("Escala encontrada");
            return ResponseEntity.ok(r);
        } catch (IllegalArgumentException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r);
        }
    }

    @GetMapping
    public ResponseEntity<HttpGlobalResponse<List<GradingScaleResponseDTO>>> listAll() {
        HttpGlobalResponse<List<GradingScaleResponseDTO>> r = new HttpGlobalResponse<>();
        r.setData(service.listAll());
        r.setMessage("Escalas recuperadas con éxito");
        return ResponseEntity.ok(r);
    }
}
