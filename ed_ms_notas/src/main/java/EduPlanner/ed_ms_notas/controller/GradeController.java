package EduPlanner.ed_ms_notas.controller;

import com.eduplanner.ed_lib_common.dto.GradeRequestDTO;
import com.eduplanner.ed_lib_common.dto.GradeResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import EduPlanner.ed_ms_notas.service.GradePdfService;
import EduPlanner.ed_ms_notas.service.GradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService service;
    private final GradePdfService pdfService;

    @PostMapping
    public ResponseEntity<HttpGlobalResponse<GradeResponseDTO>> registerGrade(@Valid @RequestBody GradeRequestDTO req) {
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
    public ResponseEntity<HttpGlobalResponse<GradeResponseDTO>> updateGrade(@PathVariable Integer id, @Valid @RequestBody GradeRequestDTO req) {
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

    @GetMapping("/by-student")
    public ResponseEntity<HttpGlobalResponse<List<GradeResponseDTO>>> getByStudent(
            @RequestParam Integer student, @RequestParam Integer period) {
        HttpGlobalResponse<List<GradeResponseDTO>> r = new HttpGlobalResponse<>();
        r.setData(service.getByStudentAndPeriod(student, period));
        r.setMessage("Notas recuperadas con éxito");
        return ResponseEntity.ok(r);
    }

    @GetMapping("/by-course")
    public ResponseEntity<HttpGlobalResponse<List<GradeResponseDTO>>> getByCourse(
            @RequestParam Integer course, @RequestParam Integer subject, @RequestParam Integer period) {
        HttpGlobalResponse<List<GradeResponseDTO>> r = new HttpGlobalResponse<>();
        r.setData(service.getByCourseAndSubjectAndPeriod(course, subject, period));
        r.setMessage("Notas recuperadas con éxito");
        return ResponseEntity.ok(r);
    }

    /**
     * RF 9.4 - Generar y descargar en PDF las notas de un estudiante o de un curso/asignatura.
     * GET /eduplanner/grades/pdf?student=15&period=1
     * GET /eduplanner/grades/pdf?course=1&subject=1&period=1
     */
    @GetMapping("/pdf")
    public ResponseEntity<byte[]> downloadPdf(
            @RequestParam(required = false) Integer student,
            @RequestParam(required = false) Integer course,
            @RequestParam(required = false) Integer subject,
            @RequestParam Integer period) {

        List<GradeResponseDTO> records;
        String title;
        String fileName;

        if (student != null) {
            records = service.getByStudentAndPeriod(student, period);
            title = "Reporte de notas - Estudiante " + student;
            fileName = pdfService.buildFileName("notas_estudiante", student, period);
        } else if (course != null && subject != null) {
            records = service.getByCourseAndSubjectAndPeriod(course, subject, period);
            title = "Reporte de notas - Curso " + course;
            fileName = pdfService.buildFileName("notas_curso", course, period);
        } else {
            return ResponseEntity.badRequest().build();
        }

        String subtitle = "Periodo: " + period;
        byte[] pdf = pdfService.generatePdf(title, subtitle, records);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", fileName);

        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}
