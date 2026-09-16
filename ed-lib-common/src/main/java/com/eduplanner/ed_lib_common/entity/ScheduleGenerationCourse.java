package com.eduplanner.ed_lib_common.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(
    name = "schedule_generation_course",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_generation_course",
        columnNames = {"id_schedule_generation", "id_course"}
    )
)
public class ScheduleGenerationCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_schedule_generation_course")
    private Integer idScheduleGenerationCourse;

    @Column(name = "id_schedule_generation", nullable = false)
    private Integer idScheduleGeneration;

    @Column(name = "id_course", nullable = false)
    private Integer idCourse;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() { createdAt = LocalDateTime.now(); }
}