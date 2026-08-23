package com.eduplanner.ed_lib_common.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;


/**
 * Tabla Periodo académico
 * AcademicPeriod
 */
@Entity
@Data
@Table(name = "academic_period")
public class AcademicPeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_period")
    private Integer idPeriod;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private Boolean status = true;

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