package com.EduPlanner.ed_ms_gestion_academica.service;

import com.eduplanner.ed_lib_common.dto.AcademicLevelRequestDTO;
import com.eduplanner.ed_lib_common.dto.AcademicLevelResponseDTO;
import com.eduplanner.ed_lib_common.entity.AcademicLevel;
import com.EduPlanner.ed_ms_gestion_academica.repository.AcademicLevelRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AcademicLevelService {

    private final AcademicLevelRepository repository;

    /**
     * Listar todos lo niveles
     * @return
     */
    public List<AcademicLevelResponseDTO> findAll() {
        return repository.findAll().stream().map(AcademicLevelResponseDTO::fromEntity).toList();
    }


    /**
     * Buscar por Id
     * @param id
     * @return
     */
    public AcademicLevelResponseDTO findById(Integer id) {
        return AcademicLevelResponseDTO.fromEntity(getOrThrow(id));
    }


    /**
     * Crear Nivel
     * @param dto
     * @return
     */
    @Transactional
    public AcademicLevelResponseDTO create(AcademicLevelRequestDTO dto) {
        if (repository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("Ya existe un nivel con ese nombre");
        }
        AcademicLevel level = new AcademicLevel();
        level.setName(dto.getName());
        level.setDescription(dto.getDescription());
        level.setStatus(true);
        return AcademicLevelResponseDTO.fromEntity(repository.save(level));
    }

    /**
     * Editar Nivel
     * @param id
     * @param dto
     * @return
     */
    @Transactional
    public AcademicLevelResponseDTO update(Integer id, AcademicLevelRequestDTO dto) {
        AcademicLevel level = getOrThrow(id);
        level.setName(dto.getName());
        level.setDescription(dto.getDescription());
        return AcademicLevelResponseDTO.fromEntity(repository.save(level));
    }

    /**
     * Eliminar / Desactivar Nivel
     * @param id
     */
    @Transactional
    public void deactivate(Integer id) {
        AcademicLevel level = getOrThrow(id);
        level.setStatus(false);
        repository.save(level);
    }

    private AcademicLevel getOrThrow(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Nivel académico no encontrado con id: " + id));
    }
}