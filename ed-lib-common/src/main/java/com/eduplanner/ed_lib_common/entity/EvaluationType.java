package com.eduplanner.ed_lib_common.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

/** RF 9.1 - Tipo/equivalencia de calificación dentro de una escala (ej. 4.5 = "Excelente") */
@Entity
@Data
@Table(name = "evaluation_type")
public class EvaluationType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evaluation_type")
    private Integer idEvaluationType;

    @Column(name = "FK_id_scale", nullable = false)
    private Integer idScale;

    @Column(name = "numeric_grade", precision = 5, scale = 2)
    private BigDecimal numericGrade;

    @Column(name = "letter_grade", length = 50)
    private String letterGrade;
}
