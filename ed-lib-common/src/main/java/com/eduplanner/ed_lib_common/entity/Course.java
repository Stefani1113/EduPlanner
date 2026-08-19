package com.eduplanner.ed_lib_common.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/** RF 8.1.1 - Course information (name, level, shift, student count) */
@Entity
@Data
@Table(name = "course")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_course")
    private Integer idCourse;

    @Column(name = "id_period", nullable = false)
    private Integer idPeriod;

    @Column(name = "id_level", nullable = false)
    private Integer idLevel;

    @Column(name = "id_shift", nullable = false)
    private Integer idShift;

    @Column(name = "homeroom_teacher")
    private Integer homeroomTeacher;

    @Column(name = "name", nullable = false, length = 20)
    private String name;

    @Column(name = "student_count", nullable = false)
    private Short studentCount = 0;

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
