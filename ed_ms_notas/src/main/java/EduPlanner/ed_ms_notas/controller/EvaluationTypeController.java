package eduPlanner.ed_ms_notas.controller;


import com.eduplanner.ed_lib_common.dto.EvaluationTypeRequestDTO;
import com.eduplanner.ed_lib_common.dto.EvaluationTypeResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import eduPlanner.ed_ms_notas.service.EvaluationTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**Tipos de evaluación dentro de una escala. Base: /eduplanner/evaluation-types */
@RestController
@RequestMapping("/evaluation-types")
@RequiredArgsConstructor
public class EvaluationTypeController {

    private final EvaluationTypeService service;

    @PostMapping
    public ResponseEntity<HttpGlobalResponse<EvaluationTypeResponseDTO>> register(
            @Valid @RequestBody EvaluationTypeRequestDTO req) {
        HttpGlobalResponse<EvaluationTypeResponseDTO> r = new HttpGlobalResponse<>();
        try {
            r.setData(service.register(req));
            r.setMessage("Tipo de evaluación registrado con éxito");
            return ResponseEntity.status(HttpStatus.CREATED).body(r);
        } catch (IllegalArgumentException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(r);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<EvaluationTypeResponseDTO>> getById(@PathVariable Integer id) {
        HttpGlobalResponse<EvaluationTypeResponseDTO> r = new HttpGlobalResponse<>();
        try {
            r.setData(service.getById(id));
            r.setMessage("Tipo de evaluación encontrado");
            return ResponseEntity.ok(r);
        } catch (IllegalArgumentException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r);
        }
    }

    @GetMapping
    public ResponseEntity<HttpGlobalResponse<List<EvaluationTypeResponseDTO>>> listAll() {
        HttpGlobalResponse<List<EvaluationTypeResponseDTO>> r = new HttpGlobalResponse<>();
        r.setData(service.listAll());
        r.setMessage("Tipos de evaluación recuperados con éxito");
        return ResponseEntity.ok(r);
    }
}
