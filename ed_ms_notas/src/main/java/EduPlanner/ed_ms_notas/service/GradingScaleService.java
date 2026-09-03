package eduPlanner.ed_ms_notas.service;

import com.eduplanner.ed_lib_common.dto.GradingScaleRequestDTO;
import com.eduplanner.ed_lib_common.dto.GradingScaleResponseDTO;
import com.eduplanner.ed_lib_common.entity.GradingScale;
import eduPlanner.ed_ms_notas.repository.GradingScaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/** RF 9.1 - Configurar escala de calificación */
@Service
@RequiredArgsConstructor
public class GradingScaleService {

    private final GradingScaleRepository repository;

    public GradingScaleResponseDTO register(GradingScaleRequestDTO req) {
        validateRange(req.getMinimumValue(), req.getMaximumValue(), req.getMinimumPassGrade());

        GradingScale scale = new GradingScale();
        scale.setMinimumValue(req.getMinimumValue());
        scale.setMaximumValue(req.getMaximumValue());
        scale.setMinimumPassGrade(req.getMinimumPassGrade());

        return toResponse(repository.save(scale));
    }

    public GradingScaleResponseDTO update(Integer id, GradingScaleRequestDTO req) {
        validateRange(req.getMinimumValue(), req.getMaximumValue(), req.getMinimumPassGrade());

        GradingScale scale = getOrThrow(id);
        scale.setMinimumValue(req.getMinimumValue());
        scale.setMaximumValue(req.getMaximumValue());
        scale.setMinimumPassGrade(req.getMinimumPassGrade());

        return toResponse(repository.save(scale));
    }

    public GradingScaleResponseDTO getById(Integer id) {
        return toResponse(getOrThrow(id));
    }

    public List<GradingScaleResponseDTO> listAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    private void validateRange(java.math.BigDecimal min, java.math.BigDecimal max, java.math.BigDecimal pass) {
        if (min.compareTo(max) >= 0) {
            throw new IllegalArgumentException("El valor mínimo debe ser menor que el valor máximo");
        }
        if (pass.compareTo(min) < 0 || pass.compareTo(max) > 0) {
            throw new IllegalArgumentException("La nota mínima de aprobación debe estar dentro del rango [mínimo, máximo]");
        }
    }

    GradingScale getOrThrow(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Escala de calificación no encontrada: " + id));
    }

    private GradingScaleResponseDTO toResponse(GradingScale s) {
        GradingScaleResponseDTO r = new GradingScaleResponseDTO();
        r.setIdScale(s.getIdScale());
        r.setMinimumValue(s.getMinimumValue());
        r.setMaximumValue(s.getMaximumValue());
        r.setMinimumPassGrade(s.getMinimumPassGrade());
        return r;
    }
}
