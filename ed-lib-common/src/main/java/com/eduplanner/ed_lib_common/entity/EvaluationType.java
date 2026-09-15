package com.eduplanner.ed_lib_common.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

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
