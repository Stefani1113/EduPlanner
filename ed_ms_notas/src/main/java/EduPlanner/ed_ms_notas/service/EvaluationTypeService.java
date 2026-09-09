package eduPlanner.ed_ms_notas.service;

import com.eduplanner.ed_lib_common.dto.EvaluationTypeRequestDTO;
import com.eduplanner.ed_lib_common.dto.EvaluationTypeResponseDTO;
import com.eduplanner.ed_lib_common.entity.EvaluationType;
import eduPlanner.ed_ms_notas.repository.EvaluationTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EvaluationTypeService {

    private final EvaluationTypeRepository repository;
    private final GradingScaleService gradingScaleService;

    public EvaluationTypeResponseDTO register(EvaluationTypeRequestDTO req) {
        gradingScaleService.getOrThrow(req.getIdScale()); // valida que la escala exista

        EvaluationType e = new EvaluationType();
        e.setIdScale(req.getIdScale());
        e.setNumericGrade(req.getNumericGrade());
        e.setLetterGrade(req.getLetterGrade());
        return toResponse(repository.save(e));
    }

    public List<EvaluationTypeResponseDTO> listAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    public EvaluationTypeResponseDTO getById(Integer id) {
        return toResponse(getOrThrow(id));
    }

    EvaluationType getOrThrow(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tipo de evaluación no encontrado: " + id));
    }

    private EvaluationTypeResponseDTO toResponse(EvaluationType e) {
        EvaluationTypeResponseDTO r = new EvaluationTypeResponseDTO();
        r.setIdEvaluationType(e.getIdEvaluationType());
        r.setIdScale(e.getIdScale());
        r.setNumericGrade(e.getNumericGrade());
        r.setLetterGrade(e.getLetterGrade());
        return r;
    }
}
