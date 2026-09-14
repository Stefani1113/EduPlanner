package com.eduplanner.ed_lib_common.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "schedule_generation")
public class ScheduleGeneration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_schedule_generation")
    private Integer idScheduleGeneration;

    @Column(name = "id_period", nullable = false)
    private Integer idPeriod;

    @Enumerated(EnumType.STRING)
    @Column(name = "generation_type", nullable = false)
    private ScheduleGeneration scheduleGenerationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GenerationStatus status = GenerationStatus.PROCESSING;

    @Column(name = "generated_by", nullable = false)
    private Integer generatedBy;

    @Column(name = "execution_time_seconds")
    private Integer executionTimeSeconds;

    @Column(length = 500)
    private String observations;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() { createdAt = updatedAt = LocalDateTime.now(); }

    @PreUpdate
    public void preUpdate() { updatedAt = LocalDateTime.now(); }
}