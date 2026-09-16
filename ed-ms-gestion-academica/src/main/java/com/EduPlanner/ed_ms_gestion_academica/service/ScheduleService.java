package com.EduPlanner.ed_ms_gestion_academica.service;

import com.EduPlanner.ed_ms_gestion_academica.client.AdministracionServiceClient;
import com.EduPlanner.ed_ms_gestion_academica.repository.AcademicLoadRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.AcademicTeacherRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.ScheduleGenerationCourseRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.ScheduleGenerationRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.ScheduleRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.SubjectRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.TimeSlotRepository;
import com.eduplanner.ed_lib_common.dto.ScheduleGenerationRequestDTO;
import com.eduplanner.ed_lib_common.dto.ScheduleItemRequestDTO;
import com.eduplanner.ed_lib_common.dto.ScheduleResponseDTO;
import com.eduplanner.ed_lib_common.entity.AcademicLoad;
import com.eduplanner.ed_lib_common.entity.AcademicTeacher;
import com.eduplanner.ed_lib_common.entity.Schedule;
import com.eduplanner.ed_lib_common.entity.ScheduleGeneration;
import com.eduplanner.ed_lib_common.entity.ScheduleGenerationCourse;
import com.eduplanner.ed_lib_common.entity.SchedulerGenerationType;
import com.eduplanner.ed_lib_common.entity.Subject;
import com.eduplanner.ed_lib_common.entity.TimeSlot;
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
    private final AdministracionServiceClient administracionServiceClient;
    private final AcademicTeacherRepository academicTeacherRepository;
    private final SubjectRepository subjectRepository;
    private final TimeSlotRepository timeSlotRepository;

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

    /**
     * Filtrar horario por curso
     */
    public List<ScheduleResponseDTO> getScheduleByCourse(Integer idCourse) {

    List<AcademicLoad> loads =
            academicLoadRepository.findByIdCourseAndStatusTrue(idCourse);

    List<Integer> loadIds = loads.stream()
            .map(AcademicLoad::getIdAcademicLoad)
            .toList();

    if (loadIds.isEmpty()) {
        return List.of();
    }

    List<Schedule> schedules =
            scheduleRepository.findByIdAcademicLoadInAndStatusTrue(loadIds);

    return schedules.stream()
            .map(this::buildScheduleResponse)
            .toList();
    }

    /**
     * Filtrar horario por docente
     */
    public List<ScheduleResponseDTO> getScheduleByTeacher(Integer idTeacher) {

    List<AcademicLoad> loads =
            academicLoadRepository.findByIdTeacherAndStatusTrue(idTeacher);

    List<Integer> loadIds = loads.stream()
            .map(AcademicLoad::getIdAcademicLoad)
            .toList();

    if (loadIds.isEmpty()) {
        return List.of();
    }

    List<Schedule> schedules =
            scheduleRepository.findByIdAcademicLoadInAndStatusTrue(loadIds);

    return schedules.stream()
            .map(this::buildScheduleResponse)
            .toList();
    }

    /**
     * Listar horario de docente y estudiante
     */
    public List<ScheduleResponseDTO> getMySchedule(
        Integer idUser,
        String role) {

    if ("DOCENTE".equals(role)) {

        AcademicTeacher teacher = academicTeacherRepository
                .findByIdUser(idUser)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No se encontró información académica para el docente"
                        ));

        return getScheduleByTeacher(
                teacher.getIdAcademicTeacher()
        );
    }

    if ("ESTUDIANTE".equals(role)) {

        
        Integer idCourse =
                administracionServiceClient.getUserCourse(idUser);

        if (idCourse == null) {
            throw new IllegalArgumentException(
                    "El estudiante no tiene un curso asignado"
            );
        }

        return getScheduleByCourse(idCourse);
    }

    throw new IllegalArgumentException(
            "El usuario no tiene un rol válido para consultar un horario"
    );
    }

    /**
     * Metodo para convertir Schedule en el DTO para el front
     */
    private ScheduleResponseDTO buildScheduleResponse(Schedule schedule) {

        AcademicLoad load = academicLoadRepository
                .findById(schedule.getIdAcademicLoad())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No se encontró la carga académica"
                        ));

        Subject subject = subjectRepository
                .findById(load.getIdSubject())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No se encontró la asignatura"
                        ));

        TimeSlot timeSlot = timeSlotRepository
                .findById(schedule.getIdTimeSlot())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No se encontró el bloque horario"
                        ));

        AcademicTeacher teacher = academicTeacherRepository
                .findById(load.getIdTeacher())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No se encontró el docente"
                        ));

        String teacherName =
                administracionServiceClient.getUserFullName(
                        teacher.getIdUser()
                );

        ScheduleResponseDTO dto = new ScheduleResponseDTO();

        dto.setIdSchedule(schedule.getIdSchedule());

        dto.setIdCourse(load.getIdCourse());

        dto.setIdSubject(subject.getIdSubject());
        dto.setSubjectName(subject.getName());

        dto.setIdTeacher(teacher.getIdAcademicTeacher());
        dto.setTeacherName(teacherName);

        dto.setIdTimeSlot(timeSlot.getIdTimeSlot());
        dto.setSlotOrder(timeSlot.getSlotOrder());
        dto.setStartTime(timeSlot.getStartTime());
        dto.setEndTime(timeSlot.getEndTime());

        dto.setDayOfWeek(schedule.getDayOfWeek());

        return dto;
    }
}