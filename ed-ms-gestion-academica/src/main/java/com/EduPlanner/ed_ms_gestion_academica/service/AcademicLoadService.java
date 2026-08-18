package com.EduPlanner.ed_ms_gestion_academica.service;
import com.eduplanner.ed_lib_common.dto.AcademicLoadRequestDTO;
import com.eduplanner.ed_lib_common.dto.AcademicLoadResponseDTO;
import com.eduplanner.ed_lib_common.entity.AcademicLoad;
import com.EduPlanner.ed_ms_gestion_academica.repository.AcademicLoadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor @Log4j2
public class AcademicLoadService {
    private final AcademicLoadRepository repository;

    public AcademicLoadResponseDTO registerLoad(AcademicLoadRequestDTO req) {
        if (repository.existsByIdTeacherAndIdCourseAndIdSubject(req.getIdTeacher(), req.getIdCourse(), req.getIdSubject()))
            throw new IllegalArgumentException("La carga académica ya existe para este profesor, curso y materia");
        AcademicLoad l = new AcademicLoad(); map(req, l);
        return toResponse(repository.save(l));
    }
    public AcademicLoadResponseDTO updateLoad(Integer id, AcademicLoadRequestDTO req) {
        AcademicLoad l = getOrThrow(id); map(req, l); return toResponse(repository.save(l));
    }
    public List<AcademicLoadResponseDTO> listLoads() { return repository.findByStatusTrue().stream().map(this::toResponse).toList(); }
    public AcademicLoadResponseDTO getLoadById(Integer id) { return toResponse(getOrThrow(id)); }
    public List<AcademicLoadResponseDTO> getLoadsByTeacher(Integer id) { return repository.findByIdTeacherAndStatusTrue(id).stream().map(this::toResponse).toList(); }
    public List<AcademicLoadResponseDTO> getLoadsByCourse(Integer id) { return repository.findByIdCourseAndStatusTrue(id).stream().map(this::toResponse).toList(); }
    public List<AcademicLoadResponseDTO> getLoadsBySubject(Integer id) { return repository.findByIdSubjectAndStatusTrue(id).stream().map(this::toResponse).toList(); }
    public void deleteLoad(Integer id) { AcademicLoad l = getOrThrow(id); l.setStatus(false); repository.save(l); }
    private AcademicLoad getOrThrow(Integer id) { return repository.findById(id).orElseThrow(() -> new RuntimeException("Academic load not found: " + id)); }
    private void map(AcademicLoadRequestDTO r, AcademicLoad l) {
        l.setIdTeacher(r.getIdTeacher()); l.setIdCourse(r.getIdCourse()); l.setIdSubject(r.getIdSubject());
        l.setWeeklyHours(r.getWeeklyHours()); l.setPriority(r.getPriority() != null ? r.getPriority() : 1);
    }
    private AcademicLoadResponseDTO toResponse(AcademicLoad l) {
        AcademicLoadResponseDTO r = new AcademicLoadResponseDTO();
        r.setIdAcademicLoad(l.getIdAcademicLoad()); r.setIdTeacher(l.getIdTeacher()); r.setIdCourse(l.getIdCourse());
        r.setIdSubject(l.getIdSubject()); r.setWeeklyHours(l.getWeeklyHours()); r.setPriority(l.getPriority());
        r.setStatus(l.getStatus()); r.setCreatedAt(l.getCreatedAt()); r.setUpdatedAt(l.getUpdatedAt());
        return r;
    }
}
