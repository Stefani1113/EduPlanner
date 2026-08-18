package com.EduPlanner.ed_ms_gestion_academica.service;
import com.eduplanner.ed_lib_common.dto.AcademicTeacherRequestDTO;
import com.eduplanner.ed_lib_common.dto.AcademicTeacherResponseDTO;
import com.eduplanner.ed_lib_common.entity.AcademicTeacher;
import com.EduPlanner.ed_ms_gestion_academica.repository.AcademicTeacherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor @Log4j2
public class AcademicTeacherService {
    private final AcademicTeacherRepository repository;

    public AcademicTeacherResponseDTO registerTeacher(AcademicTeacherRequestDTO req) {
        if (repository.existsByIdUser(req.getIdUser()))
            throw new IllegalArgumentException("Información académica ya registrada para el usuario: " + req.getIdUser());
        if (req.getMaxWeeklyHours() < req.getMaxDailyHours())
            throw new IllegalArgumentException("Las horas máximas semanales deben ser >= las horas máximas diarias");
        AcademicTeacher t = new AcademicTeacher();
        t.setIdUser(req.getIdUser()); t.setMaxDailyHours(req.getMaxDailyHours()); t.setMaxWeeklyHours(req.getMaxWeeklyHours()); t.setStatus(true);
        return toResponse(repository.save(t));
    }

    public AcademicTeacherResponseDTO updateTeacher(Integer id, AcademicTeacherRequestDTO req) {
        AcademicTeacher t = getOrThrow(id);
        if (req.getMaxWeeklyHours() < req.getMaxDailyHours())
            throw new IllegalArgumentException("Las horas máximas semanales deben ser >= las horas máximas diarias");
        t.setMaxDailyHours(req.getMaxDailyHours()); t.setMaxWeeklyHours(req.getMaxWeeklyHours());
        return toResponse(repository.save(t));
    }

    public List<AcademicTeacherResponseDTO> listTeachers() {
        return repository.findByStatusTrue().stream().map(this::toResponse).toList();
    }

    public AcademicTeacherResponseDTO getTeacherById(Integer id) { return toResponse(getOrThrow(id)); }

    public void deleteTeacher(Integer id) {
        AcademicTeacher t = getOrThrow(id); t.setStatus(false); repository.save(t);
    }

    private AcademicTeacher getOrThrow(Integer id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Profesor académico no encontrado: " + id));
    }

    private AcademicTeacherResponseDTO toResponse(AcademicTeacher t) {
        AcademicTeacherResponseDTO r = new AcademicTeacherResponseDTO();
        r.setIdAcademicTeacher(t.getIdAcademicTeacher()); r.setIdUser(t.getIdUser());
        r.setMaxDailyHours(t.getMaxDailyHours()); r.setMaxWeeklyHours(t.getMaxWeeklyHours());
        r.setStatus(t.getStatus()); r.setCreatedAt(t.getCreatedAt()); r.setUpdatedAt(t.getUpdatedAt());
        return r;
    }
}
