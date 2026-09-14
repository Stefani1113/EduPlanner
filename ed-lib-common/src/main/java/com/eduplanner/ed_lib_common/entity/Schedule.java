package com.eduplanner.ed_lib_common.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(
    name = "schedule",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_schedule",
        columnNames = {"id_schedule_generation", "id_academic_load", "day_of_week", "id_time_slot"}
    )
)
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_schedule")
    private Integer idSchedule;

    @Column(name = "id_schedule_generation", nullable = false)
    private Integer idScheduleGeneration;

    @Column(name = "id_academic_load", nullable = false)
    private Integer idAcademicLoad;

    @Column(name = "id_time_slot", nullable = false)
    private Integer idTimeSlot;

    @Column(name = "day_of_week", nullable = false)
    private Short dayOfWeek;

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_type", nullable = false)
    private ScheduleType scheduleType = ScheduleType.REGULAR;

    @Column(nullable = false)
    private Boolean status = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() { createdAt = updatedAt = LocalDateTime.now(); }

    @PreUpdate
    public void preUpdate() { updatedAt = LocalDateTime.now(); }
}