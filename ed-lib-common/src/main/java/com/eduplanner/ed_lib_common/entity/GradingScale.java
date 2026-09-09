package com.eduplanner.ed_lib_common.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

/** RF 9.1 - Configurar escala de calificación */
@Entity
@Data
@Table(name = "grading_scale")
public class GradingScale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_scale")
    private Integer idScale;

    @Column(name = "minimum_value", nullable = false, precision = 5, scale = 2)
    private BigDecimal minimumValue;

    @Column(name = "maximum_value", nullable = false, precision = 5, scale = 2)
    private BigDecimal maximumValue;

    @Column(name = "minimum_pass_grade", nullable = false, precision = 5, scale = 2)
    private BigDecimal minimumPassGrade;
}
