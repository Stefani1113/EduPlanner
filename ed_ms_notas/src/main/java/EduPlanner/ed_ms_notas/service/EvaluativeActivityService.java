package eduPlanner.ed_ms_notas.service;

import com.eduplanner.ed_lib_common.dto.EvaluativeActivityRequestDTO;
import com.eduplanner.ed_lib_common.dto.EvaluativeActivityResponseDTO;
import com.eduplanner.ed_lib_common.entity.EvaluativeActivity;
import eduPlanner.ed_ms_notas.repository.EvaluativeActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EvaluativeActivityService {

    private final EvaluativeActivityRepository repository;

    public EvaluativeActivityResponseDTO register(EvaluativeActivityRequestDTO req) {
        if (!req.getStartDate().isBefore(req.getEndDate())) {
            throw new IllegalArgumentException("La fecha de inicio debe ser anterior a la fecha de fin");
        }
        EvaluativeActivity a = new EvaluativeActivity();
        a.setIdPeriod(req.getIdPeriod());
        a.setStartDate(req.getStartDate());
        a.setEndDate(req.getEndDate());
        a.setEvaluationName(req.getEvaluationName());
        a.setWeightPercentage(req.getWeightPercentage());
        a.setIsActive(true);
        return toResponse(repository.save(a));
    }

    public List<EvaluativeActivityResponseDTO> listAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    public EvaluativeActivityResponseDTO getById(Integer id) {
        return toResponse(getOrThrow(id));
    }

    private EvaluativeActivity getOrThrow(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Actividad evaluativa no encontrada: " + id));
    }

    private EvaluativeActivityResponseDTO toResponse(EvaluativeActivity a) {
        EvaluativeActivityResponseDTO r = new EvaluativeActivityResponseDTO();
        r.setIdEvaluative(a.getIdEvaluative());
        r.setIdPeriod(a.getIdPeriod());
        r.setStartDate(a.getStartDate());
        r.setEndDate(a.getEndDate());
        r.setIsActive(a.getIsActive());
        r.setEvaluationName(a.getEvaluationName());
        r.setWeightPercentage(a.getWeightPercentage());
        return r;
    }
}
