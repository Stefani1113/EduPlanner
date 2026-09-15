package com.EduPlanner.ed_ms_gestion_academica.service;

import com.EduPlanner.ed_ms_gestion_academica.repository.AcademicLoadRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.ScheduleGenerationCourseRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.ScheduleGenerationRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.ScheduleRepository;
import com.eduplanner.ed_lib_common.dto.ScheduleGenerationRequestDTO;
import com.eduplanner.ed_lib_common.dto.ScheduleItemRequestDTO;
import com.eduplanner.ed_lib_common.entity.AcademicLoad;
import com.eduplanner.ed_lib_common.entity.Schedule;
import com.eduplanner.ed_lib_common.entity.ScheduleGeneration;
import com.eduplanner.ed_lib_common.entity.ScheduleGenerationCourse;
import com.eduplanner.ed_lib_common.entity.SchedulerGenerationType;
import com.eduplanner.ed_lib_common.entity.SchedulerGenerationStatus;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleGenerationRepository generationRepository;
    private final ScheduleGenerationCourseRepository generationCourseRepository;
    private final ScheduleRepository scheduleRepository;
    private final AcademicLoadRepository academicLoadRepository;

    @Transactional
    public Integer saveGeneration(ScheduleGenerationRequestDTO dto) {

        /**
         * Crear la generación
         */
        ScheduleGeneration generation = new ScheduleGeneration();

        generation.setIdPeriod(dto.getIdPeriod());
        generation.setGenerationType(SchedulerGenerationType.COURSE);
        generation.setGeneratedBy(dto.getGeneratedBy());
        generation.setObservations(dto.getObservations());
        generation.setStatus(SchedulerGenerationStatus.PROCESSING);
        generation.setActive(true);

        ScheduleGeneration savedGeneration =
                generationRepository.save(generation);

        Integer generationId = savedGeneration.getIdScheduleGeneration();

        /**
         * Obtener las cargas académicas utilizadas
         */
        List<Integer> loadIds = dto.getSchedules()
                .stream()
                .map(ScheduleItemRequestDTO::getIdAcademicLoad)
                .distinct()
                .toList();

        List<AcademicLoad> loads =
                academicLoadRepository.findAllByIdAcademicLoadIn(loadIds);

        /**
         * Registrar los cursos involucrados
         */
        Set<Integer> courseIds = new HashSet<>();

        for (AcademicLoad load : loads) {
            courseIds.add(load.getIdCourse());
        }

        for (Integer courseId : courseIds) {

            ScheduleGenerationCourse generationCourse =
                    new ScheduleGenerationCourse();

            generationCourse.setIdScheduleGeneration(generationId);
            generationCourse.setIdCourse(courseId);

            generationCourseRepository.save(generationCourse);
        }

        /**
         * Guardar las clases
         */
        for (ScheduleItemRequestDTO item : dto.getSchedules()) {

            Schedule schedule = new Schedule();

            schedule.setIdScheduleGeneration(generationId);
            schedule.setIdAcademicLoad(item.getIdAcademicLoad());
            schedule.setIdTimeSlot(item.getIdTimeSlot());
            schedule.setDayOfWeek(item.getDayOfWeek());
            schedule.setScheduleType(dto.getScheduleType());
            schedule.setStatus(true);

            scheduleRepository.save(schedule);
        }

        /**
         * Marcar la generación como completada
         */
        savedGeneration.setStatus(
                SchedulerGenerationStatus.COMPLETED
        );

        generationRepository.save(savedGeneration);

        return generationId;
    }
}