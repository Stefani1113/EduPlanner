package com.EduPlanner.ed_ms_gestion_academica.service;

import com.eduplanner.ed_lib_common.dto.TimeSlotRequestDTO;
import com.eduplanner.ed_lib_common.dto.TimeSlotResponseDTO;
import com.eduplanner.ed_lib_common.entity.TimeSlot;
import com.EduPlanner.ed_ms_gestion_academica.repository.SchoolShiftRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.TimeSlotRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TimeSlotService {

    private final TimeSlotRepository repository;
    private final SchoolShiftRepository schoolShiftRepository;


    /**
     * Listar todos
     * @return
     */
    public List<TimeSlotResponseDTO> findAll() {
        return repository.findAll().stream().map(TimeSlotResponseDTO::fromEntity).toList();
    }

    /**
     * Listar por periodo
     * @param idShift
     * @return
     */

    public List<TimeSlotResponseDTO> findByShift(Integer idShift) {
        return repository.findByIdShift(idShift).stream().map(TimeSlotResponseDTO::fromEntity).toList();
    }

    /**
     * Listar por Id
     * @param id
     * @return
     */
    public TimeSlotResponseDTO findById(Integer id) {
        return TimeSlotResponseDTO.fromEntity(getOrThrow(id));
    }


    /**
     * Crear Franja
     * @param dto
     * @return
     */
    @Transactional
    public TimeSlotResponseDTO create(TimeSlotRequestDTO dto) {
        validateTimes(dto.getStartTime(), dto.getEndTime());

        if (!schoolShiftRepository.existsById(dto.getIdShift())) {
            throw new IllegalArgumentException("La jornada indicada no existe");
        }
        if (repository.existsByIdShiftAndSlotOrder(dto.getIdShift(), dto.getSlotOrder())) {
            throw new IllegalArgumentException("Ya existe un bloque con ese orden para esta jornada");
        }

        TimeSlot slot = new TimeSlot();
        slot.setIdShift(dto.getIdShift());
        slot.setSlotOrder(dto.getSlotOrder());
        slot.setStartTime(dto.getStartTime());
        slot.setEndTime(dto.getEndTime());
        slot.setIsBreak(dto.getIsBreak() != null ? dto.getIsBreak() : false);
        slot.setStatus(true);

        return TimeSlotResponseDTO.fromEntity(repository.save(slot));
    }

    /**
     * Editar Franja
     * @param id
     * @param dto
     * @return
     */
    @Transactional
    public TimeSlotResponseDTO update(Integer id, TimeSlotRequestDTO dto) {
        validateTimes(dto.getStartTime(), dto.getEndTime());
        TimeSlot slot = getOrThrow(id);

        if (!schoolShiftRepository.existsById(dto.getIdShift())) {
            throw new IllegalArgumentException("La jornada indicada no existe");
        }

        slot.setIdShift(dto.getIdShift());
        slot.setSlotOrder(dto.getSlotOrder());
        slot.setStartTime(dto.getStartTime());
        slot.setEndTime(dto.getEndTime());
        slot.setIsBreak(dto.getIsBreak() != null ? dto.getIsBreak() : false);

        return TimeSlotResponseDTO.fromEntity(repository.save(slot));
    }

    /**
     * Desactivar Franja
     * @param id
     */
    @Transactional
    public void deactivate(Integer id) {
        TimeSlot slot = getOrThrow(id);
        slot.setStatus(false);
        repository.save(slot);
    }

    private void validateTimes(LocalTime start, LocalTime end) {
        if (!start.isBefore(end)) {
            throw new IllegalArgumentException("La hora de inicio debe ser anterior a la hora de fin");
        }
    }

    private TimeSlot getOrThrow(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bloque horario no encontrado con id: " + id));
    }
}