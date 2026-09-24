package com.eduplanner.ed_lib_common.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

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
