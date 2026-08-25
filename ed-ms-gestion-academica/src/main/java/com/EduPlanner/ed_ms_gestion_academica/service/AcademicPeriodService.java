package com.EduPlanner.ed_ms_gestion_academica.service;

import com.eduplanner.ed_lib_common.dto.AcademicPeriodRequestDTO;
import com.eduplanner.ed_lib_common.dto.AcademicPeriodResponseDTO;
import com.eduplanner.ed_lib_common.entity.AcademicPeriod;
import com.EduPlanner.ed_ms_gestion_academica.repository.AcademicPeriodRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AcademicPeriodService {

    private final AcademicPeriodRepository repository;

    public List<AcademicPeriodResponseDTO> findAll() {
        return repository.findAll().stream()
                .map(AcademicPeriodResponseDTO::fromEntity)
                .toList();
    }

    public AcademicPeriodResponseDTO findById(Integer id) {
        return AcademicPeriodResponseDTO.fromEntity(getOrThrow(id));
    }

    @Transactional
    public AcademicPeriodResponseDTO create(AcademicPeriodRequestDTO dto) {
        validateDates(dto.getStartDate(), dto.getEndDate());
        if (repository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("Ya existe un periodo con ese nombre");
        }

        AcademicPeriod period = new AcademicPeriod();
        period.setName(dto.getName());
        period.setStartDate(dto.getStartDate());
        period.setEndDate(dto.getEndDate());
        period.setStatus(true);

        return AcademicPeriodResponseDTO.fromEntity(repository.save(period));
    }

    @Transactional
    public AcademicPeriodResponseDTO update(Integer id, AcademicPeriodRequestDTO dto) {
        validateDates(dto.getStartDate(), dto.getEndDate());
        AcademicPeriod period = getOrThrow(id);

        period.setName(dto.getName());
        period.setStartDate(dto.getStartDate());
        period.setEndDate(dto.getEndDate());

        return AcademicPeriodResponseDTO.fromEntity(repository.save(period));
    }

    @Transactional
    public void deactivate(Integer id) {
        AcademicPeriod period = getOrThrow(id);
        period.setStatus(false);
        repository.save(period);
    }

    private void validateDates(java.time.LocalDate start, java.time.LocalDate end) {
        if (!start.isBefore(end)) {
            throw new IllegalArgumentException("La fecha de inicio debe ser anterior a la fecha de fin");
        }
    }

    private AcademicPeriod getOrThrow(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Periodo académico no encontrado con id: " + id));
    }
}