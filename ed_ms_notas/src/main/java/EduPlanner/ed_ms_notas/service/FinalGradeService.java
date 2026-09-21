package EduPlanner.ed_ms_notas.service;

import EduPlanner.ed_ms_notas.client.AdministracionServiceClient;
import EduPlanner.ed_ms_notas.client.GestionAcademicaServiceClient;
import EduPlanner.ed_ms_notas.notification.EmailTemplateService;
import EduPlanner.ed_ms_notas.repository.EvaluationTypeRepository;
import EduPlanner.ed_ms_notas.repository.EvaluativeActivityRepository;
import EduPlanner.ed_ms_notas.repository.FinalGradeRepository;
import EduPlanner.ed_ms_notas.repository.GradeRepository;
import com.eduplanner.ed_lib_common.dto.FinalGradeResponseDTO;
import com.eduplanner.ed_lib_common.dto.UserInfoDTO;
import com.eduplanner.ed_lib_common.entity.EvaluationType;
import com.eduplanner.ed_lib_common.entity.EvaluativeActivity;
import com.eduplanner.ed_lib_common.entity.FinalGrade;
import com.eduplanner.ed_lib_common.entity.Grade;
import com.eduplanner.ed_lib_common.entity.GradingScale;
import com.eduplanner.ed_lib_common.notifications.Notifier;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * RF 9.2 - Calcular promedios: calcula automáticamente la nota definitiva de
 * un estudiante en una asignatura/periodo, ponderando cada {@link Grade} por
 * el weight_percentage de su {@link EvaluativeActivity}.
 * <p>
 * RF 9.5 - Notificar notas definitivas: una vez calculada y guardada la nota
 * definitiva, se notifica al estudiante por correo (vía {@link Notifier}).
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class FinalGradeService {

    private final GradeRepository gradeRepository;
    private final FinalGradeRepository finalGradeRepository;
    private final EvaluativeActivityRepository evaluativeActivityRepository;
    private final EvaluationTypeRepository evaluationTypeRepository;
    private final GradingScaleService gradingScaleService;
    private final AdministracionServiceClient administracionServiceClient;
    private final GestionAcademicaServiceClient gestionAcademicaServiceClient;
    private final Notifier notifier;
    private final EmailTemplateService emailTemplateService;

    /**
     * Calcula (o recalcula) la nota definitiva de un estudiante para una
     * asignatura y periodo, la guarda y notifica al estudiante.
     */
    public FinalGradeResponseDTO calculateFinalGrade(Integer idStudent, Integer idSubject, Integer idPeriod) {
        List<Grade> grades = gradeRepository.findByIdStudentAndIdSubjectAndIdPeriod(idStudent, idSubject, idPeriod);
        if (grades.isEmpty()) {
            throw new IllegalArgumentException(
                    "El estudiante " + idStudent + " no tiene notas registradas en la asignatura " + idSubject
                            + " para el periodo " + idPeriod);
        }

        BigDecimal weightedSum = BigDecimal.ZERO;
        BigDecimal weightTotal = BigDecimal.ZERO;
        Integer idScale = null;
        Integer lastGradeId = null;

        for (Grade g : grades) {
            EvaluativeActivity activity = evaluativeActivityRepository.findById(g.getIdEvaluative())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Actividad evaluativa no encontrada: " + g.getIdEvaluative()));

            BigDecimal weight = activity.getWeightPercentage();
            weightedSum = weightedSum.add(g.getGradeValue().multiply(weight));
            weightTotal = weightTotal.add(weight);

            if (idScale == null) {
                EvaluationType type = evaluationTypeRepository.findById(g.getIdEvaluationType())
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Tipo de evaluación no encontrado: " + g.getIdEvaluationType()));
                idScale = type.getIdScale();
            }
            if (lastGradeId == null || g.getIdGrade() > lastGradeId) {
                lastGradeId = g.getIdGrade();
            }
        }

        if (weightTotal.compareTo(BigDecimal.ZERO) == 0) {
            throw new IllegalStateException(
                    "Las actividades evaluativas involucradas no tienen ponderación (weight_percentage) configurada");
        }

        BigDecimal average = weightedSum.divide(weightTotal, 2, RoundingMode.HALF_UP);

        GradingScale scale = gradingScaleService.getOrThrow(idScale);
        boolean passed = average.compareTo(scale.getMinimumPassGrade()) >= 0;

        FinalGrade finalGrade = finalGradeRepository
                .findByIdStudentAndIdSubjectAndIdPeriod(idStudent, idSubject, idPeriod)
                .orElseGet(FinalGrade::new);
        finalGrade.setIdStudent(idStudent);
        finalGrade.setIdSubject(idSubject);
        finalGrade.setIdPeriod(idPeriod);
        finalGrade.setIdGrade(lastGradeId);
        finalGrade.setFinalGrade(average);
        finalGrade.setPassed(passed);

        FinalGrade saved = finalGradeRepository.save(finalGrade);

        log.info("Nota definitiva calculada: estudiante={}, asignatura={}, periodo={}, promedio={}, aprobado={}",
                idStudent, idSubject, idPeriod, average, passed);

        notifyStudent(saved);

        return toResponse(saved);
    }

    /** Calcula la nota definitiva de todos los estudiantes de un curso en una asignatura/periodo. */
    public List<FinalGradeResponseDTO> calculateForCourse(Integer idCourse, Integer idSubject, Integer idPeriod) {
        List<Grade> grades = gradeRepository.findByIdCourseAndIdSubjectAndIdPeriod(idCourse, idSubject, idPeriod);
        List<Integer> students = grades.stream().map(Grade::getIdStudent).distinct().toList();
        if (students.isEmpty()) {
            throw new IllegalArgumentException(
                    "No hay notas registradas para el curso " + idCourse + ", asignatura " + idSubject
                            + " en el periodo " + idPeriod);
        }
        return students.stream()
                .map(idStudent -> calculateFinalGrade(idStudent, idSubject, idPeriod))
                .toList();
    }

    public FinalGradeResponseDTO getByStudentSubjectPeriod(Integer idStudent, Integer idSubject, Integer idPeriod) {
        FinalGrade fg = finalGradeRepository.findByIdStudentAndIdSubjectAndIdPeriod(idStudent, idSubject, idPeriod)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Aún no hay nota definitiva calculada para este estudiante/asignatura/periodo"));
        return toResponse(fg);
    }

    public List<FinalGradeResponseDTO> getBySubjectAndPeriod(Integer idSubject, Integer idPeriod) {
        return finalGradeRepository.findByIdSubjectAndIdPeriod(idSubject, idPeriod).stream()
                .map(this::toResponse)
                .toList();
    }

    /** RF 9.5 - Notifica al estudiante que su nota definitiva ya está disponible. */
    private void notifyStudent(FinalGrade fg) {
        try {
            UserInfoDTO student = administracionServiceClient.getUserInfo(fg.getIdStudent());
            if (student == null || student.getEmail() == null || student.getEmail().isBlank()) {
                log.warn("No se pudo notificar al estudiante {}: no existe o no tiene correo registrado",
                        fg.getIdStudent());
                return;
            }

            String subjectName = gestionAcademicaServiceClient.getSubjectName(fg.getIdSubject());
            String periodName = gestionAcademicaServiceClient.getAcademicPeriodName(fg.getIdPeriod());
            String estado = Boolean.TRUE.equals(fg.getPassed()) ? "Aprobado" : "Reprobado";

            String topic = "Nota definitiva disponible - "
                    + (subjectName != null ? subjectName : ("Asignatura " + fg.getIdSubject()));

            String message = "Hola " + student.getName() + ",<br><br>"
                    + "Tu nota definitiva de <b>" + (subjectName != null ? subjectName : fg.getIdSubject())
                    + "</b> para el periodo <b>" + (periodName != null ? periodName : fg.getIdPeriod())
                    + "</b> ya está disponible.<br><br>"
                    + "Nota final: <b>" + fg.getFinalGrade() + "</b> (" + estado + ")<br><br>"
                    + "Ingresa a la plataforma EduPlanner para ver el detalle.";

            notifier.send(student.getEmail(), topic, message);
        } catch (Exception e) {
            // Un fallo al notificar no debe hacer fallar el cálculo de la nota.
            log.error("Error notificando la nota definitiva del estudiante {}: {}", fg.getIdStudent(), e.getMessage());
        }
    }

    private FinalGradeResponseDTO toResponse(FinalGrade fg) {
        FinalGradeResponseDTO r = new FinalGradeResponseDTO();
        r.setIdFinal(fg.getIdFinal());

        r.setIdStudent(fg.getIdStudent());
        r.setStudentName(administracionServiceClient.getUserName(fg.getIdStudent()));

        r.setIdSubject(fg.getIdSubject());
        r.setSubjectName(gestionAcademicaServiceClient.getSubjectName(fg.getIdSubject()));

        r.setIdPeriod(fg.getIdPeriod());
        r.setPeriodName(gestionAcademicaServiceClient.getAcademicPeriodName(fg.getIdPeriod()));

        r.setFinalGrade(fg.getFinalGrade());
        r.setPassed(fg.getPassed());
        return r;
    }
}
