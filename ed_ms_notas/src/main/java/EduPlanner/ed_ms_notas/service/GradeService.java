package eduPlanner.ed_ms_notas.service;

import eduPlanner.ed_ms_notas.client.AdministracionServiceClient;
import eduPlanner.ed_ms_notas.client.GestionAcademicaServiceClient;
import com.eduplanner.ed_lib_common.dto.GradeRequestDTO;
import com.eduplanner.ed_lib_common.dto.GradeResponseDTO;
import com.eduplanner.ed_lib_common.entity.EvaluationType;
import com.eduplanner.ed_lib_common.entity.EvaluativeActivity;
import com.eduplanner.ed_lib_common.entity.Grade;
import com.eduplanner.ed_lib_common.entity.GradingScale;
import eduPlanner.ed_ms_notas.repository.EvaluationTypeRepository;
import eduPlanner.ed_ms_notas.repository.EvaluativeActivityRepository;
import eduPlanner.ed_ms_notas.repository.GradeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/** RF 9 - Registrar notas */
@Service
@RequiredArgsConstructor
@Log4j2
public class GradeService {

    private static final String STATUS_REGISTERED = "REGISTERED";

    private final GradeRepository repository;
    private final EvaluationTypeRepository evaluationTypeRepository;
    private final EvaluativeActivityRepository evaluativeActivityRepository;
    private final GradingScaleService gradingScaleService;
    private final AdministracionServiceClient administracionServiceClient;
    private final GestionAcademicaServiceClient gestionAcademicaServiceClient;

    public GradeResponseDTO registerGrade(GradeRequestDTO req) {
        validateIsRole(req.getIdStudent(), "ESTUDIANTE", "estudiante");
        validateIsRole(req.getIdTeacher(), "DOCENTE", "docente");
        validateAcademicReferences(req);

        EvaluativeActivity activity = evaluativeActivityRepository.findById(req.getIdEvaluative())
                .orElseThrow(() -> new IllegalArgumentException("Actividad evaluativa no encontrada: " + req.getIdEvaluative()));
        if (!Boolean.TRUE.equals(activity.getIsActive())) {
            throw new IllegalArgumentException("La actividad evaluativa " + req.getIdEvaluative() + " no está activa");
        }

        EvaluationType evaluationType = evaluationTypeRepository.findById(req.getIdEvaluationType())
                .orElseThrow(() -> new IllegalArgumentException("Tipo de evaluación no encontrado: " + req.getIdEvaluationType()));

        // RF 9.1 - Validar que la nota esté dentro del rango de la escala configurada
        GradingScale scale = gradingScaleService.getOrThrow(evaluationType.getIdScale());
        if (req.getGradeValue().compareTo(scale.getMinimumValue()) < 0
                || req.getGradeValue().compareTo(scale.getMaximumValue()) > 0) {
            throw new IllegalArgumentException(
                    "La nota debe estar entre " + scale.getMinimumValue() + " y " + scale.getMaximumValue()
                            + " según la escala configurada");
        }

        if (repository.existsByIdStudentAndIdSubjectAndIdEvaluativeAndIdEvaluationType(
                req.getIdStudent(), req.getIdSubject(), req.getIdEvaluative(), req.getIdEvaluationType())) {
            throw new IllegalArgumentException(
                    "Ya existe una nota registrada para este estudiante, asignatura, actividad y tipo de evaluación");
        }

        Grade grade = new Grade();
        map(req, grade);
        grade.setStatus(STATUS_REGISTERED);
        grade.setRegistrationDate(LocalDate.now());

        log.info("Nota registrada: estudiante={}, asignatura={}, valor={}",
                req.getIdStudent(), req.getIdSubject(), req.getGradeValue());

        return toResponse(repository.save(grade));
    }

    public GradeResponseDTO updateGrade(Integer id, GradeRequestDTO req) {
        Grade grade = getOrThrow(id);
        validateAcademicReferences(req);

        EvaluationType evaluationType = evaluationTypeRepository.findById(req.getIdEvaluationType())
                .orElseThrow(() -> new IllegalArgumentException("Tipo de evaluación no encontrado: " + req.getIdEvaluationType()));
        GradingScale scale = gradingScaleService.getOrThrow(evaluationType.getIdScale());
        if (req.getGradeValue().compareTo(scale.getMinimumValue()) < 0
                || req.getGradeValue().compareTo(scale.getMaximumValue()) > 0) {
            throw new IllegalArgumentException(
                    "La nota debe estar entre " + scale.getMinimumValue() + " y " + scale.getMaximumValue()
                            + " según la escala configurada");
        }

        map(req, grade);
        grade.setStatus("MODIFIED");
        return toResponse(repository.save(grade));
    }

    public GradeResponseDTO getById(Integer id) {
        return toResponse(getOrThrow(id));
    }

    /** RF 9.3 (parcial) - Consultar notas de un estudiante en un periodo */
    public List<GradeResponseDTO> getByStudentAndPeriod(Integer idStudent, Integer idPeriod) {
        return repository.findByIdStudentAndIdPeriod(idStudent, idPeriod).stream().map(this::toResponse).toList();
    }

    /** RF 9.3 (parcial) - Consultar notas de un curso completo en una asignatura y periodo */
    public List<GradeResponseDTO> getByCourseAndSubjectAndPeriod(Integer idCourse, Integer idSubject, Integer idPeriod) {
        return repository.findByIdCourseAndIdSubjectAndIdPeriod(idCourse, idSubject, idPeriod).stream().map(this::toResponse).toList();
    }

    /** Valida que el curso, la asignatura y el periodo existan en ed-ms-gestion-academica */
    private void validateAcademicReferences(GradeRequestDTO req) {
        if (!gestionAcademicaServiceClient.courseExists(req.getIdCourse())) {
            throw new IllegalArgumentException("El curso " + req.getIdCourse() + " no existe en gestión académica");
        }
        if (!gestionAcademicaServiceClient.subjectExists(req.getIdSubject())) {
            throw new IllegalArgumentException("La asignatura " + req.getIdSubject() + " no existe en gestión académica");
        }
        if (!gestionAcademicaServiceClient.academicPeriodExists(req.getIdPeriod())) {
            throw new IllegalArgumentException("El periodo " + req.getIdPeriod() + " no existe en gestión académica");
        }
    }

    private void validateIsRole(Integer idUser, String expectedRole, String label) {
        String role = administracionServiceClient.getUserRole(idUser);
        if (role == null) {
            throw new IllegalArgumentException("El " + label + " " + idUser + " no existe en administración");
        }
        if (!expectedRole.equals(role)) {
            throw new IllegalArgumentException("El usuario " + idUser + " no tiene rol " + expectedRole);
        }
    }

    private Grade getOrThrow(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Nota no encontrada: " + id));
    }

    private void map(GradeRequestDTO r, Grade g) {
        g.setIdStudent(r.getIdStudent());
        g.setIdCourse(r.getIdCourse());
        g.setIdTeacher(r.getIdTeacher());
        g.setIdPeriod(r.getIdPeriod());
        g.setIdSubject(r.getIdSubject());
        g.setIdEvaluative(r.getIdEvaluative());
        g.setIdEvaluationType(r.getIdEvaluationType());
        g.setGradeValue(r.getGradeValue());
    }

    private GradeResponseDTO toResponse(Grade g) {
        GradeResponseDTO r = new GradeResponseDTO();
        r.setIdGrade(g.getIdGrade());
        r.setIdStudent(g.getIdStudent());
        r.setIdCourse(g.getIdCourse());
        r.setIdTeacher(g.getIdTeacher());
        r.setIdPeriod(g.getIdPeriod());
        r.setIdSubject(g.getIdSubject());
        r.setIdEvaluative(g.getIdEvaluative());
        r.setIdEvaluationType(g.getIdEvaluationType());
        r.setGradeValue(g.getGradeValue());
        r.setStatus(g.getStatus());
        r.setRegistrationDate(g.getRegistrationDate());
        return r;
    }
}
