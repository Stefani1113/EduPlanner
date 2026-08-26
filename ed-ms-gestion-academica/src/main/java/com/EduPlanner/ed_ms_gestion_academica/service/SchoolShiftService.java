package com.EduPlanner.ed_ms_gestion_academica.service;

import com.eduplanner.ed_lib_common.dto.SchoolShiftRequestDTO;
import com.eduplanner.ed_lib_common.dto.SchoolShiftResponseDTO;
import com.eduplanner.ed_lib_common.entity.SchoolShift;
import com.EduPlanner.ed_ms_gestion_academica.repository.SchoolShiftRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SchoolShiftService {

    private final SchoolShiftRepository repository;

    /**
     * Listar todos las jornadas
     * @return
     */
    public List<SchoolShiftResponseDTO> findAll() {
        return repository.findAll().stream().map(SchoolShiftResponseDTO::fromEntity).toList();
    }

    /**
     * Buscar por Id 
     * @param id
     * @return
     */
    public SchoolShiftResponseDTO findById(Integer id) {
        return SchoolShiftResponseDTO.fromEntity(getOrThrow(id));
    }

    /**
     * Crear Jornada 
     * @param dto
     * @return
     */
    @Transactional
    public SchoolShiftResponseDTO create(SchoolShiftRequestDTO dto) {
        validateTimes(dto.getStartTime(), dto.getEndTime());
        if (repository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("Ya existe una jornada con ese nombre");
        }
        SchoolShift shift = new SchoolShift();
        shift.setName(dto.getName());
        shift.setStartTime(dto.getStartTime());
        shift.setEndTime(dto.getEndTime());
        shift.setStatus(true);
        return SchoolShiftResponseDTO.fromEntity(repository.save(shift));
    }

    /**
     * Editar Jornada
     * @param id
     * @param dto
     * @return
     */
    @Transactional
    public SchoolShiftResponseDTO update(Integer id, SchoolShiftRequestDTO dto) {
        validateTimes(dto.getStartTime(), dto.getEndTime());
        SchoolShift shift = getOrThrow(id);
        shift.setName(dto.getName());
        shift.setStartTime(dto.getStartTime());
        shift.setEndTime(dto.getEndTime());
        return SchoolShiftResponseDTO.fromEntity(repository.save(shift));
    }

    /**
     * Desactivar / Eliminar Jornada
     * @param id
     */
    @Transactional
    public void deactivate(Integer id) {
        SchoolShift shift = getOrThrow(id);
        shift.setStatus(false);
        repository.save(shift);
    }

    private void validateTimes(LocalTime start, LocalTime end) {
        if (!start.isBefore(end)) {
            throw new IllegalArgumentException("La hora de inicio debe ser anterior a la hora de fin");
        }
    }

    private SchoolShift getOrThrow(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Jornada no encontrada con id: " + id));
    }
}