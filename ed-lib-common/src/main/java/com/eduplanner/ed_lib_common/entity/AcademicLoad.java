package com.eduplanner.ed_lib_common.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/** RF 8.1.2 - Academic load (subject + teacher + course + weekly hours) */
@Entity
@Data
@Table(name = "academic_load")
public class AcademicLoad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_academic_load")
    private Integer idAcademicLoad;

    @Column(name = "id_teacher", nullable = false)
    private Integer idTeacher;

    @Column(name = "id_course", nullable = false)
    private Integer idCourse;

    @Column(name = "id_subject", nullable = false)
    private Integer idSubject;

    @Column(name = "weekly_hours", nullable = false)
    private Byte weeklyHours;

    @Column(name = "priority", nullable = false)
    private Byte priority = 1;

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
