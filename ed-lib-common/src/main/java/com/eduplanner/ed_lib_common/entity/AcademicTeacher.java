package com.eduplanner.ed_lib_common.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/** RF 8.1 - Teacher academic information (availability, workload) */
@Entity
@Data
@Table(name = "academic_teacher")
public class AcademicTeacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_academic_teacher")
    private Integer idAcademicTeacher;

    @Column(name = "id_user", nullable = false, unique = true)
    private Integer idUser;

    @Column(name = "max_daily_hours", nullable = false)
    private Byte maxDailyHours;

    @Column(name = "max_weekly_hours", nullable = false)
    private Byte maxWeeklyHours;

    @Column(name = "status", nullable = false)
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
