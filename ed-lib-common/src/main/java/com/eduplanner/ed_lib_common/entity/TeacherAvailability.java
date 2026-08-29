package com.eduplanner.ed_lib_common.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "teacher_availability")
public class TeacherAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_availability")
    private Integer idAvailability;

    @Column(name = "id_teacher", nullable = false)
    private Integer idTeacher;

    @Column(name = "id_time_slot", nullable = false)
    private Integer idTimeSlot;

    @Column(name = "day_of_week", nullable = false)
    private Short dayOfWeek;

    @Column(nullable = false)
    private Boolean available = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() { 
        createdAt = updatedAt = LocalDateTime.now(); 
    }

    @PreUpdate
    public void preUpdate() { 
        updatedAt = LocalDateTime.now(); 
    }
}