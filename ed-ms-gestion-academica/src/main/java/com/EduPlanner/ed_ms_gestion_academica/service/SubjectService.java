    package com.EduPlanner.ed_ms_gestion_academica.service;
import com.eduplanner.ed_lib_common.dto.SubjectRequestDTO;
import com.eduplanner.ed_lib_common.dto.SubjectResponseDTO;
import com.eduplanner.ed_lib_common.entity.Course;
import com.eduplanner.ed_lib_common.entity.Subject;
import com.EduPlanner.ed_ms_gestion_academica.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor @Log4j2
public class SubjectService {
    private final SubjectRepository repository;

    public SubjectResponseDTO registerSubject(SubjectRequestDTO req) {
        if (repository.existsByName(req.getName())) throw new IllegalArgumentException("El tema ya existe: " + req.getName());
        Subject s = new Subject(); map(req, s);
        return toResponse(repository.save(s));
    }
    public SubjectResponseDTO updateSubject(Integer id, SubjectRequestDTO req) {
        Subject s = getOrThrow(id);
        if (!s.getName().equalsIgnoreCase(req.getName()) && repository.existsByName(req.getName()))
            throw new IllegalArgumentException("El nombre del tema ya está en uso");
        map(req, s); return toResponse(repository.save(s));
    }
    public List<SubjectResponseDTO> listSubjects() { return repository.findByStatusTrue().stream().map(this::toResponse).toList(); }
    public SubjectResponseDTO getSubjectById(Integer id) { return toResponse(getOrThrow(id));
    }

    public List<SubjectResponseDTO> searchSubjects(String name) { return repository.findByNameContainingIgnoreCaseAndStatusTrue(name).stream().map(this::toResponse).toList();
    }

    public void deleteSubject(Integer id) { Subject s = getOrThrow(id); repository.delete(s);
    }

    private Subject getOrThrow(Integer id) { return repository.findById(id).orElseThrow(() -> new RuntimeException("Asunto no encontrado: " + id)); 
    }

    private void map(SubjectRequestDTO r, Subject s) { s.setName(r.getName()); s.setDescription(r.getDescription()); s.setColor(r.getColor()); }
    private SubjectResponseDTO toResponse(Subject s) {
        SubjectResponseDTO r = new SubjectResponseDTO();
        r.setIdSubject(s.getIdSubject()); r.setName(s.getName()); r.setDescription(s.getDescription());
        r.setColor(s.getColor()); r.setStatus(s.getStatus()); r.setCreatedAt(s.getCreatedAt()); r.setUpdatedAt(s.getUpdatedAt());
        return r;
    }
}
