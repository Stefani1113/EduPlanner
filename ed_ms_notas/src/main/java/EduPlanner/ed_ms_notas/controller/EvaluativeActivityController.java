package eduPlanner.ed_ms_notas.controller;

import com.eduplanner.ed_lib_common.dto.EvaluativeActivityRequestDTO;
import com.eduplanner.ed_lib_common.dto.EvaluativeActivityResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import eduPlanner.ed_ms_notas.service.EvaluativeActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** RF 9 - Actividades evaluativas. Base: /eduplanner/evaluative-activities */
@RestController
@RequestMapping("/evaluative-activities")
@RequiredArgsConstructor
public class EvaluativeActivityController {

    private final EvaluativeActivityService service;

    @PostMapping
    public ResponseEntity<HttpGlobalResponse<EvaluativeActivityResponseDTO>> register(
            @Valid @RequestBody EvaluativeActivityRequestDTO req) {
        HttpGlobalResponse<EvaluativeActivityResponseDTO> r = new HttpGlobalResponse<>();
        try {
            r.setData(service.register(req));
            r.setMessage("Actividad evaluativa registrada con éxito");
            return ResponseEntity.status(HttpStatus.CREATED).body(r);
        } catch (IllegalArgumentException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(r);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<EvaluativeActivityResponseDTO>> getById(@PathVariable Integer id) {
        HttpGlobalResponse<EvaluativeActivityResponseDTO> r = new HttpGlobalResponse<>();
        try {
            r.setData(service.getById(id));
            r.setMessage("Actividad evaluativa encontrada");
            return ResponseEntity.ok(r);
        } catch (IllegalArgumentException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r);
        }
    }

    @GetMapping
    public ResponseEntity<HttpGlobalResponse<List<EvaluativeActivityResponseDTO>>> listAll() {
        HttpGlobalResponse<List<EvaluativeActivityResponseDTO>> r = new HttpGlobalResponse<>();
        r.setData(service.listAll());
        r.setMessage("Actividades evaluativas recuperadas con éxito");
        return ResponseEntity.ok(r);
    }
}
