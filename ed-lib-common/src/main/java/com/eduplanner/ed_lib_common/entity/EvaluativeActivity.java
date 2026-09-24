package com.eduplanner.ed_lib_common.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "evaluative_activity")
public class EvaluativeActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evaluative")
    private Integer idEvaluative;

    @Column(name = "FK_id_period", nullable = false)
    private Integer idPeriod;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "evaluation_name", nullable = false, length = 150)
    private String evaluationName;

    @Column(name = "weight_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal weightPercentage;
}
