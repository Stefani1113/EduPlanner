package eduPlanner.ed_ms_notas.controller;

import com.eduplanner.ed_lib_common.dto.GradeRequestDTO;
import com.eduplanner.ed_lib_common.dto.GradeResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import eduPlanner.ed_ms_notas.service.GradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** RF 9 - Registrar notas. Base: /eduplanner/grades */
@RestController
@RequestMapping("/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService service;

    @PostMapping
    public ResponseEntity<HttpGlobalResponse<GradeResponseDTO>> registerGrade(
            @Valid @RequestBody GradeRequestDTO req) {
        HttpGlobalResponse<GradeResponseDTO> r = new HttpGlobalResponse<>();
        try {
            r.setData(service.registerGrade(req));
            r.setMessage("Nota registrada con éxito");
            return ResponseEntity.status(HttpStatus.CREATED).body(r);
        } catch (IllegalArgumentException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(r);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<GradeResponseDTO>> updateGrade(
            @PathVariable Integer id, @Valid @RequestBody GradeRequestDTO req) {
        HttpGlobalResponse<GradeResponseDTO> r = new HttpGlobalResponse<>();
        try {
            r.setData(service.updateGrade(id, req));
            r.setMessage("Nota actualizada con éxito");
            return ResponseEntity.ok(r);
        } catch (IllegalArgumentException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(r);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<HttpGlobalResponse<GradeResponseDTO>> getById(@PathVariable Integer id) {
        HttpGlobalResponse<GradeResponseDTO> r = new HttpGlobalResponse<>();
        try {
            r.setData(service.getById(id));
            r.setMessage("Nota encontrada");
            return ResponseEntity.ok(r);
        } catch (IllegalArgumentException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r);
        }
    }

    /** GET /eduplanner/grades/by-student?student=15&period=1 */
    @GetMapping("/by-student")
    public ResponseEntity<HttpGlobalResponse<List<GradeResponseDTO>>> getByStudent(
            @RequestParam Integer student, @RequestParam Integer period) {
        HttpGlobalResponse<List<GradeResponseDTO>> r = new HttpGlobalResponse<>();
        r.setData(service.getByStudentAndPeriod(student, period));
        r.setMessage("Notas recuperadas con éxito");
        return ResponseEntity.ok(r);
    }

    /** GET /eduplanner/grades/by-course?course=1&subject=1&period=1 */
    @GetMapping("/by-course")
    public ResponseEntity<HttpGlobalResponse<List<GradeResponseDTO>>> getByCourse(
            @RequestParam Integer course, @RequestParam Integer subject, @RequestParam Integer period) {
        HttpGlobalResponse<List<GradeResponseDTO>> r = new HttpGlobalResponse<>();
        r.setData(service.getByCourseAndSubjectAndPeriod(course, subject, period));
        r.setMessage("Notas recuperadas con éxito");
        return ResponseEntity.ok(r);
    }
}
