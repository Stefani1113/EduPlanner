package com.EduPlanner.ed_ms_gestion_academica.service;
import com.eduplanner.ed_lib_common.dto.CourseRequestDTO;
import com.eduplanner.ed_lib_common.dto.CourseResponseDTO;
import com.eduplanner.ed_lib_common.entity.Course;
import com.EduPlanner.ed_ms_gestion_academica.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor @Log4j2
public class CourseService {
    private final CourseRepository repository;

    public CourseResponseDTO registerCourse(CourseRequestDTO req) {
        if (repository.existsByNameAndIdPeriod(req.getName(), req.getIdPeriod()))
            throw new IllegalArgumentException("El curso ya existe: " + req.getName());
        Course c = new Course();
        map(req, c);
        return toResponse(repository.save(c));
    }

    public CourseResponseDTO updateCourse(Integer id, CourseRequestDTO req) {
        Course c = getOrThrow(id);
        if (!c.getName().equalsIgnoreCase(req.getName()) && repository.existsByNameAndIdPeriod(req.getName(), req.getIdPeriod()))
            throw new IllegalArgumentException("El nombre del curso ya está en uso");
        map(req, c);
        return toResponse(repository.save(c));
    }

    public List<CourseResponseDTO> listCourses() { return repository.findByStatusTrue().stream().map(this::toResponse).toList(); }
    public CourseResponseDTO getCourseById(Integer id) { return toResponse(getOrThrow(id)); }
    public List<CourseResponseDTO> getCoursesByPeriod(Integer id) { return repository.findByIdPeriodAndStatusTrue(id).stream().map(this::toResponse).toList(); }
    public List<CourseResponseDTO> getCoursesByLevel(Integer id) { return repository.findByIdLevelAndStatusTrue(id).stream().map(this::toResponse).toList(); }
    public List<CourseResponseDTO> getCoursesByShift(Integer id) { return repository.findByIdShiftAndStatusTrue(id).stream().map(this::toResponse).toList(); }

    public void deleteCourse(Integer id) { Course c = getOrThrow(id); repository.delete(c);}

    private Course getOrThrow(Integer id) { return repository.findById(id).orElseThrow(() -> new RuntimeException("Curso no encontrado: " + id)); }
    private void map(CourseRequestDTO r, Course c) {
        c.setIdPeriod(r.getIdPeriod()); c.setIdLevel(r.getIdLevel()); c.setIdShift(r.getIdShift());
        c.setHomeroomTeacher(r.getHomeroomTeacher()); c.setName(r.getName()); c.setStudentCount(r.getStudentCount());
    }
    private CourseResponseDTO toResponse(Course c) {
        CourseResponseDTO r = new CourseResponseDTO();
        r.setIdCourse(c.getIdCourse()); r.setIdPeriod(c.getIdPeriod()); r.setIdLevel(c.getIdLevel());
        r.setIdShift(c.getIdShift()); r.setHomeroomTeacher(c.getHomeroomTeacher()); r.setName(c.getName());
        r.setStudentCount(c.getStudentCount()); r.setStatus(c.getStatus()); r.setCreatedAt(c.getCreatedAt()); r.setUpdatedAt(c.getUpdatedAt());
        return r;
    }
}
