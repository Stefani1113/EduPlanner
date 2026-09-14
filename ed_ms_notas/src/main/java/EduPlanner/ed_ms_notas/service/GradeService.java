package EduPlanner.ed_ms_notas.service;

import EduPlanner.ed_ms_notas.client.AdministracionFeignClient;
import EduPlanner.ed_ms_notas.client.GestionAcademicaFeignClient;
import EduPlanner.ed_ms_notas.dto.GradeRequestDTO;
import EduPlanner.ed_ms_notas.dto.GradeResponseDTO;
import EduPlanner.ed_ms_notas.dto.HttpGlobalResponse;
import EduPlanner.ed_ms_notas.dto.UserInfoDTO;
import EduPlanner.ed_ms_notas.entity.EvaluationType;
import EduPlanner.ed_ms_notas.entity.EvaluativeActivity;
import EduPlanner.ed_ms_notas.entity.Grade;
import EduPlanner.ed_ms_notas.entity.GradingScale;
import EduPlanner.ed_ms_notas.repository.EvaluationTypeRepository;
import EduPlanner.ed_ms_notas.repository.EvaluativeActivityRepository;
import EduPlanner.ed_ms_notas.repository.GradeRepository;
import feign.FeignException;
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
    private final AdministracionFeignClient administracionFeignClient;
    private final GestionAcademicaFeignClient gestionAcademicaFeignClient;

    public GradeResponseDTO registerGrade(GradeRequestDTO req) {
        validateIsRole(req.getIdStudent(), "ESTUDIANTE", "estudiante");
        validateIsRole(req.getIdTeacher(), "DOCENTE", "docente");

        EvaluativeActivity activity = evaluativeActivityRepository.findById(req.getIdEvaluative())
                .orElseThrow(() -> new IllegalArgumentException("Actividad evaluativa no encontrada: " + req.getIdEvaluative()));
        if (!Boolean.TRUE.equals(activity.getIsActive())) {
            throw new IllegalArgumentException("La actividad evaluativa " + req.getIdEvaluative() + " no está activa");
        }

        EvaluationType evaluationType = evaluationTypeRepository.findById(req.getIdEvaluationType())
                .orElseThrow(() -> new IllegalArgumentException("Tipo de evaluación no encontrado: " + req.getIdEvaluationType()));

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

    public List<GradeResponseDTO> getByStudentAndPeriod(Integer idStudent, Integer idPeriod) {
        return repository.findByIdStudentAndIdPeriod(idStudent, idPeriod).stream().map(this::toResponse).toList();
    }

    public List<GradeResponseDTO> getByCourseAndSubjectAndPeriod(Integer idCourse, Integer idSubject, Integer idPeriod) {
        return repository.findByIdCourseAndIdSubjectAndIdPeriod(idCourse, idSubject, idPeriod).stream().map(this::toResponse).toList();
    }

    private void validateIsRole(Integer idUser, String expectedRole, String label) {
        String role;
        try {
            role = administracionFeignClient.getUserRole(idUser);
        } catch (FeignException.NotFound e) {
            throw new IllegalArgumentException("El " + label + " " + idUser + " no existe en administración");
        }
        if (role == null) {
            throw new IllegalArgumentException("El " + label + " " + idUser + " no existe en administración");
        }
        if (!expectedRole.equals(role)) {
            throw new IllegalArgumentException("El usuario " + idUser + " no tiene rol " + expectedRole);
        }
    }

    private String fetchUserName(Integer idUser) {
        try {
            HttpGlobalResponse<UserInfoDTO> resp = administracionFeignClient.getUserById(idUser);
            UserInfoDTO u = resp != null ? resp.getData() : null;
            if (u == null) return null;
            return (u.getName() != null ? u.getName() : "") + " " + (u.getSurnames() != null ? u.getSurnames() : "");
        } catch (FeignException e) {
            log.warn("No se pudo obtener el nombre del usuario {} en administración: {}", idUser, e.getMessage());
            return null;
        }
    }

    private String fetchCourseName(Integer idCourse) {
        try {
            return gestionAcademicaFeignClient.getCourseName(idCourse);
        } catch (FeignException e) {
            log.warn("No se pudo obtener el nombre del curso {}: {}", idCourse, e.getMessage());
            return null;
        }
    }

    private String fetchSubjectName(Integer idSubject) {
        try {
            return gestionAcademicaFeignClient.getSubjectName(idSubject);
        } catch (FeignException e) {
            log.warn("No se pudo obtener el nombre de la asignatura {}: {}", idSubject, e.getMessage());
            return null;
        }
    }

    private String fetchPeriodName(Integer idPeriod) {
        try {
            return gestionAcademicaFeignClient.getPeriodName(idPeriod);
        } catch (FeignException e) {
            log.warn("No se pudo obtener el nombre del periodo {}: {}", idPeriod, e.getMessage());
            return null;
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
        r.setStudentName(fetchUserName(g.getIdStudent()));

        r.setIdCourse(g.getIdCourse());
        r.setCourseName(fetchCourseName(g.getIdCourse()));

        r.setIdTeacher(g.getIdTeacher());
        r.setTeacherName(fetchUserName(g.getIdTeacher()));

        r.setIdPeriod(g.getIdPeriod());
        r.setPeriodName(fetchPeriodName(g.getIdPeriod()));

        r.setIdSubject(g.getIdSubject());
        r.setSubjectName(fetchSubjectName(g.getIdSubject()));

        r.setIdEvaluative(g.getIdEvaluative());
        r.setIdEvaluationType(g.getIdEvaluationType());
        r.setGradeValue(g.getGradeValue());
        r.setStatus(g.getStatus());
        r.setRegistrationDate(g.getRegistrationDate());
        return r;
    }
}
