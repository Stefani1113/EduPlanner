package com.EduPlanner.ed_ms_gestion_academica.service;

import com.eduplanner.ed_lib_common.dto.TeacherAvailabilityRequestDTO;
import com.eduplanner.ed_lib_common.dto.TeacherAvailabilityResponseDTO;
import com.eduplanner.ed_lib_common.entity.TeacherAvailability;
import com.EduPlanner.ed_ms_gestion_academica.repository.AcademicTeacherRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.TeacherAvailabilityRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.TimeSlotRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherAvailabilityService {

    private final TeacherAvailabilityRepository repository;
    private final AcademicTeacherRepository academicTeacherRepository;
    private final TimeSlotRepository timeSlotRepository;

    /**
     * Listar todos
     * @return
     */
    public List<TeacherAvailabilityResponseDTO> findAll() {
        return repository.findAll().stream().map(TeacherAvailabilityResponseDTO::fromEntity).toList();
    }

    /**
     * Listar por Docente
     * @param idTeacher
     * @return
     */
    public List<TeacherAvailabilityResponseDTO> findByTeacher(Integer idTeacher) {
        return repository.findByIdTeacher(idTeacher).stream()
                .map(TeacherAvailabilityResponseDTO::fromEntity).toList();
    }

    /**
     * Buscar por Id
     * @param id
     * @return
     */
    public TeacherAvailabilityResponseDTO findById(Integer id) {
        return TeacherAvailabilityResponseDTO.fromEntity(getOrThrow(id));
    }

    /**
     * Crear Disponibilidad
     * @param dto
     * @return
     */
    @Transactional
    public TeacherAvailabilityResponseDTO create(TeacherAvailabilityRequestDTO dto) {
        if (!academicTeacherRepository.existsById(dto.getIdTeacher())) {
            throw new IllegalArgumentException("El docente indicado no existe");
        }
        if (!timeSlotRepository.existsById(dto.getIdTimeSlot())) {
            throw new IllegalArgumentException("El bloque horario indicado no existe");
        }
        if (repository.existsByIdTeacherAndDayOfWeekAndIdTimeSlot(dto.getIdTeacher(), dto.getDayOfWeek(), dto.getIdTimeSlot())) {
            throw new IllegalArgumentException("Ya existe un registro de disponibilidad para ese docente, día y bloque horario");
        }
        TeacherAvailability availability = new TeacherAvailability();
        availability.setIdTeacher(dto.getIdTeacher());
        availability.setIdTimeSlot(dto.getIdTimeSlot());
        availability.setDayOfWeek(dto.getDayOfWeek());
        availability.setAvailable(dto.getAvailable() != null ? dto.getAvailable() : true);
        return TeacherAvailabilityResponseDTO.fromEntity(repository.save(availability));
    }

    /**
     * Editar Disponibilidad
     * @param id
     * @param dto
     * @return
     */
    @Transactional
    public TeacherAvailabilityResponseDTO update(Integer id, TeacherAvailabilityRequestDTO dto) {
        TeacherAvailability availability = getOrThrow(id);
        availability.setAvailable(dto.getAvailable() != null ? dto.getAvailable() : availability.getAvailable());
        return TeacherAvailabilityResponseDTO.fromEntity(repository.save(availability));
    }

    /**
     * Eliminar Disponibilidad
     * @param id
     */
    @Transactional
    public void delete(Integer id) {
        TeacherAvailability availability = getOrThrow(id);
        repository.delete(availability);
    }

    private TeacherAvailability getOrThrow(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Disponibilidad no encontrada con id: " + id));
    }
}