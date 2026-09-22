package com.EduPlanner.ed_ms_gestion_academica.service;

import com.EduPlanner.ed_ms_gestion_academica.client.AdministracionServiceClient;
import com.EduPlanner.ed_ms_gestion_academica.notifications.Notification;
import com.EduPlanner.ed_ms_gestion_academica.notifications.NotificationFactory;
import com.EduPlanner.ed_ms_gestion_academica.repository.AcademicLoadRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.AcademicPeriodRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.AcademicTeacherRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.CourseRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.ScheduleGenerationCourseRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.ScheduleGenerationRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.ScheduleRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.SubjectRepository;
import com.EduPlanner.ed_ms_gestion_academica.repository.TimeSlotRepository;
import com.eduplanner.ed_lib_common.dto.ScheduleGenerationRequestDTO;
import com.eduplanner.ed_lib_common.dto.ScheduleItemRequestDTO;
import com.eduplanner.ed_lib_common.dto.ScheduleResponseDTO;
import com.eduplanner.ed_lib_common.dto.TimeSlotResponseDTO;
import com.eduplanner.ed_lib_common.dto.UserResponseDTO;
import com.eduplanner.ed_lib_common.entity.AcademicLoad;
import com.eduplanner.ed_lib_common.entity.AcademicPeriod;
import com.eduplanner.ed_lib_common.entity.AcademicTeacher;
import com.eduplanner.ed_lib_common.entity.Course;
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
        private final CourseRepository courseRepository;
        private final AcademicPeriodRepository academicPeriodRepository;
        private final NotificationFactory notificationFactory;

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

        /*
        * Buscar las generaciones que pertenecen a este curso
        */
        List<ScheduleGenerationCourse> generationCourses =
                generationCourseRepository.findByIdCourse(idCourse);

        if (generationCourses.isEmpty()) {
                throw new IllegalArgumentException(
                        "El curso no tiene generaciones de horario registradas"
                );
        }

        /*
        * Buscar la generación publicada más reciente
        * específicamente para este curso.
        */
        ScheduleGeneration publishedGeneration =
                generationCourses.stream()
                        .map(generationCourse ->
                        generationRepository
                                .findById(
                                        generationCourse
                                        .getIdScheduleGeneration()
                                        )
                                        .orElse(null)
                        )
                        .filter(generation -> generation != null)
                        .filter(generation ->
                                generation.getStatus()
                                        == SchedulerGenerationStatus.PUBLISHED
                        )
                        .max(
                                java.util.Comparator.comparing(
                                        ScheduleGeneration::getCreatedAt
                                )
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "No existe un horario publicado para este curso"
                                )
                        );

        /*
        * Buscar los horarios de esa generación
        * utilizando las cargas académicas del curso.
        */
        List<Schedule> schedules =
                scheduleRepository
                        .findByIdScheduleGenerationAndIdAcademicLoadInAndStatusTrue(
                                publishedGeneration
                                        .getIdScheduleGeneration(),
                                loadIds
                        );

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

     if (loads.isEmpty()) {
         return List.of();
     }

     /*
      * Obtener los cursos en los que trabaja el docente.
      */
     Set<Integer> courseIds = loads.stream()
             .map(AcademicLoad::getIdCourse)
             .collect(java.util.stream.Collectors.toSet());

     /*
      * Obtener los IDs de las cargas académicas del docente.
      */
     List<Integer> loadIds = loads.stream()
             .map(AcademicLoad::getIdAcademicLoad)
             .toList();

     /*
      * Buscar las generaciones publicadas que pertenecen
      * a los cursos del docente.
      */
     Set<Integer> publishedGenerationIds = new HashSet<>();

     for (Integer idCourse : courseIds) {

         List<ScheduleGenerationCourse> generationCourses =
                 generationCourseRepository.findByIdCourse(idCourse);

         for (ScheduleGenerationCourse generationCourse :
                 generationCourses) {

             ScheduleGeneration generation =
                     generationRepository
                             .findById(
                                     generationCourse
                                             .getIdScheduleGeneration()
                             )
                             .orElse(null);

             if (generation != null
                     && generation.getStatus()
                             == SchedulerGenerationStatus.PUBLISHED) {

                 publishedGenerationIds.add(
                         generation.getIdScheduleGeneration()
                 );
             }
         }
     }

     if (publishedGenerationIds.isEmpty()) {
         return List.of();
     }

     /*
      * Buscar los horarios del docente dentro de todas
      * las generaciones publicadas correspondientes.
      */
     List<ScheduleResponseDTO> result = new java.util.ArrayList<>();

     for (Integer idGeneration : publishedGenerationIds) {

         List<Schedule> schedules =
                 scheduleRepository
                         .findByIdScheduleGenerationAndIdAcademicLoadInAndStatusTrue(
                                 idGeneration,
                                 loadIds
                         );

         result.addAll(
                 schedules.stream()
                         .map(this::buildScheduleResponse)
                         .toList()
         );
     }

     return result;
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

        Course course =
                courseRepository
                        .findById(load.getIdCourse())
                        .orElseThrow();

        ScheduleResponseDTO dto = new ScheduleResponseDTO();

        dto.setIdSchedule(schedule.getIdSchedule());

        dto.setIdCourse(load.getIdCourse());
        dto.setCourseName(course.getName());

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

        /**
        * Metodo para publicar horario y enviar notificación de publicación
        */
        @Transactional
        public void publishGeneration(Integer idGeneration) {

        //Buscar la generación
        ScheduleGeneration generation =
                generationRepository.findById(idGeneration)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "No se encontró la generación"
                                ));

        //Verificar que pueda publicarse
        if (generation.getStatus()
                != SchedulerGenerationStatus.COMPLETED) {

                throw new IllegalArgumentException(
                        "Solo se pueden publicar generaciones completadas"
                );
        }

        //Publicar la generación
        generation.setStatus(
                SchedulerGenerationStatus.PUBLISHED
        );

        generationRepository.save(generation);

        //Obtener los horarios de la generación publicada
        List<Schedule> schedules =
                scheduleRepository
                        .findByIdScheduleGenerationAndStatusTrue(
                                idGeneration
                        );

        // Si no hay horarios, no hay usuarios a notificar
        if (schedules.isEmpty()) {
                return;
        }

        //Crear el notificador
        Notification notification =
                notificationFactory.createNotification();

        //Usuarios que ya recibieron la notificación
        Set<Integer> notifiedUsers = new HashSet<>();

        //Cursos que ya fueron procesados
        Set<Integer> processedCourses = new HashSet<>();

        //Recorrer los horarios
        for (Schedule schedule : schedules) {

                // Obtener carga académica
                AcademicLoad load =
                        academicLoadRepository
                                .findById(schedule.getIdAcademicLoad())
                                .orElse(null);

                if (load == null) {
                continue;
                }

                Integer idCourse = load.getIdCourse();

                /*
                * Solo consultamos Administración una vez por curso.
                */
                if (processedCourses.add(idCourse)) {

                List<UserResponseDTO> students =
                        administracionServiceClient
                                .getUsersByCourse(idCourse);

                for (UserResponseDTO student : students) {

                        Integer idUser = student.getIdUser();

                        if (idUser == null) {
                        continue;
                        }

                        // Evitar notificación duplicada
                        if (notifiedUsers.add(idUser)) {

                        notification.send(
                                idUser,
                                "Horario actualizado",
                                "Tu horario académico ha sido actualizado.",
                                schedule.getIdSchedule()
                        );
                        }
                }
                }
                // Notificar Docente
                AcademicTeacher teacher =
                        academicTeacherRepository
                                .findById(load.getIdTeacher())
                                .orElse(null);

                if (teacher == null) {
                continue;
                }

                Integer idUserTeacher = teacher.getIdUser();

                if (idUserTeacher == null) {
                continue;
                }

                // Evitar notificación duplicada
                if (notifiedUsers.add(idUserTeacher)) {

                notification.send(
                        idUserTeacher,
                        "Horario actualizado",
                        "Tu horario académico ha sido actualizado.",
                        schedule.getIdSchedule()
                );
                }
        }
        }

        /**
         * Previsualización de horario antes de publicar
         */
        public List<ScheduleResponseDTO> previewGeneration(
                Integer idGeneration) {

        ScheduleGeneration generation =
                generationRepository.findById(idGeneration)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "No se encontró la generación"
                                ));

        if (generation.getStatus()
                == SchedulerGenerationStatus.FAILED) {

                throw new IllegalArgumentException(
                        "La generación falló y no puede ser visualizada"
                );
        }

        if (generation.getStatus()
                == SchedulerGenerationStatus.PROCESSING) {

                throw new IllegalArgumentException(
                        "La generación todavía está en proceso"
                );
        }

        List<Schedule> schedules =
                scheduleRepository
                        .findByIdScheduleGenerationAndStatusTrue(
                                idGeneration
                        );

        return schedules.stream()
                .map(this::buildScheduleResponse)
                .toList();
        }

        /**
         * Eliminar horario
         */
        @Transactional
        public void deleteGeneration(Integer idGeneration) {

                ScheduleGeneration generation =
                        generationRepository.findById(idGeneration)
                                .orElseThrow(() ->
                                        new IllegalArgumentException(
                                                "No se encontró la generación"
                                        ));
                                        
                scheduleRepository
                        .deleteByIdScheduleGeneration(idGeneration);

                generationCourseRepository
                        .deleteByIdScheduleGeneration(idGeneration);

                generationRepository.delete(generation);
        }

        /**
         * Obtener curso para descargar pdf
         */
        public Course getCourseById(Integer idCourse) {
        return courseRepository.findById(idCourse)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No se encontró el curso con id: " + idCourse
                ));
        }

        /**
         * Obtener periodo
         */
        public AcademicPeriod getAcademicPeriodById(Integer idPeriod) {
        return academicPeriodRepository.findById(idPeriod)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No se encontró el periodo académico con id: " + idPeriod
                        ));
        }

        
        /**
         * Obtener bloques horarios activos de una jornada
         */
        public List<TimeSlot> getTimeSlotsByShift(Integer idShift) {

                return timeSlotRepository
                        .findByIdShiftAndStatusTrueOrderBySlotOrderAsc(idShift);
        }

        public List<TimeSlotResponseDTO> getTimeSlotResponsesByShift(Integer idShift) {

                List<TimeSlot> timeSlots =
                        getTimeSlotsByShift(idShift);

                return timeSlots.stream()
                        .map(TimeSlotResponseDTO::fromEntity)
                        .toList();
        }
}