package EduPlanner.ed_ms_notas.controller;

import com.eduplanner.ed_lib_common.dto.FinalGradeResponseDTO;
import com.eduplanner.ed_lib_common.dto.HttpGlobalResponse;
import com.eduplanner.ed_lib_common.enums.RolEnum;
import EduPlanner.ed_ms_notas.security.RequireRole;
import EduPlanner.ed_ms_notas.service.FinalGradeService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * RF 9.2 - Calcular promedios (automático al llamar /calculate).
 * RF 9.5 - Notificar notas definitivas (se dispara internamente al calcular).
 */
@RestController
@RequestMapping("/final-grades")
@RequiredArgsConstructor
public class FinalGradeController {

    private final FinalGradeService service;

    /** Calcula/recalcula la nota definitiva de un estudiante en una asignatura/periodo. */
    @PostMapping("/calculate")
    @RequireRole({RolEnum.DOCENTE, RolEnum.ADMINISTRADOR})
    public ResponseEntity<HttpGlobalResponse<FinalGradeResponseDTO>> calculate(
            @RequestParam Integer student, @RequestParam Integer subject, @RequestParam Integer period) {
        HttpGlobalResponse<FinalGradeResponseDTO> r = new HttpGlobalResponse<>();
        try {
            r.setData(service.calculateFinalGrade(student, subject, period));
            r.setMessage("Nota definitiva calculada y notificada con éxito");
            return ResponseEntity.status(HttpStatus.CREATED).body(r);
        } catch (IllegalArgumentException | IllegalStateException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(r);
        }
    }

    /** Calcula la nota definitiva de todos los estudiantes de un curso en una asignatura/periodo. */
    @PostMapping("/calculate-course")
    @RequireRole({RolEnum.DOCENTE, RolEnum.ADMINISTRADOR})
    public ResponseEntity<HttpGlobalResponse<List<FinalGradeResponseDTO>>> calculateForCourse(
            @RequestParam Integer course, @RequestParam Integer subject, @RequestParam Integer period) {
        HttpGlobalResponse<List<FinalGradeResponseDTO>> r = new HttpGlobalResponse<>();
        try {
            r.setData(service.calculateForCourse(course, subject, period));
            r.setMessage("Notas definitivas del curso calculadas y notificadas con éxito");
            return ResponseEntity.status(HttpStatus.CREATED).body(r);
        } catch (IllegalArgumentException | IllegalStateException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(r);
        }
    }

    /** RF 9.3 - Consultar la nota definitiva de un estudiante (el propio estudiante o un docente). */
    @GetMapping("/by-student")
    @RequireRole({RolEnum.ESTUDIANTE, RolEnum.DOCENTE, RolEnum.ADMINISTRADOR})
    public ResponseEntity<HttpGlobalResponse<FinalGradeResponseDTO>> getByStudent(
            HttpServletRequest request,
            @RequestParam Integer student, @RequestParam Integer subject, @RequestParam Integer period) {
        HttpGlobalResponse<FinalGradeResponseDTO> r = new HttpGlobalResponse<>();

        if (!canViewStudentData(request, student)) {
            r.setMessage("No tienes permiso para consultar las notas de otro estudiante");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(r);
        }

        try {
            r.setData(service.getByStudentSubjectPeriod(student, subject, period));
            r.setMessage("Nota definitiva encontrada");
            return ResponseEntity.ok(r);
        } catch (IllegalArgumentException e) {
            r.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(r);
        }
    }

    /** RF 9.3 - Consultar las notas definitivas de todos los estudiantes de una asignatura/periodo. */
    @GetMapping("/by-subject")
    @RequireRole({RolEnum.DOCENTE, RolEnum.ADMINISTRADOR})
    public ResponseEntity<HttpGlobalResponse<List<FinalGradeResponseDTO>>> getBySubject(
            @RequestParam Integer subject, @RequestParam Integer period) {
        HttpGlobalResponse<List<FinalGradeResponseDTO>> r = new HttpGlobalResponse<>();
        r.setData(service.getBySubjectAndPeriod(subject, period));
        r.setMessage("Notas definitivas recuperadas con éxito");
        return ResponseEntity.ok(r);
    }

    /** Un estudiante solo puede ver sus propias notas; docentes/administradores pueden ver cualquiera. */
    private boolean canViewStudentData(HttpServletRequest request, Integer idStudent) {
        Object role = request.getAttribute("role");
        if (!"ESTUDIANTE".equals(role)) {
            return true;
        }
        Object idUser = request.getAttribute("idUser");
        return idUser != null && idUser.toString().equals(String.valueOf(idStudent));
    }
}
