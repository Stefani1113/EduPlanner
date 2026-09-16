package com.eduplanner.ed_lib_common.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Nota definitiva de un estudiante en una asignatura y periodo (RF 9.2).
 * Se calcula a partir del promedio ponderado de las {@link Grade} registradas
 * según el peso (weight_percentage) de cada {@link EvaluativeActivity}.
 */
@Entity
@Data
@Table(name = "final_grades")
public class FinalGrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_final")
    private Integer idFinal;

    @Column(name = "FK_id_period", nullable = false)
    private Integer idPeriod;

    @Column(name = "FK_id_subject", nullable = false)
    private Integer idSubject;

    @Column(name = "FK_id_student", nullable = false)
    private Integer idStudent;

    /** Última nota registrada que participó en el cálculo del promedio. */
    @Column(name = "FK_id_grade", nullable = false)
    private Integer idGrade;

    @Column(name = "final_grade", nullable = false, precision = 5, scale = 2)
    private BigDecimal finalGrade;

    @Column(name = "passed", nullable = false)
    private Boolean passed;
}
