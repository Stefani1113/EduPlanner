package com.eduplanner.ed_lib_common.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

/** RF 9 - Registrar notas: la calificación de un estudiante en una actividad evaluativa */
@Entity
@Data
@Table(name = "grades")
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_grade")
    private Integer idGrade;

    @Column(name = "FK_id_student", nullable = false)
    private Integer idStudent;

    @Column(name = "FK_id_course", nullable = false)
    private Integer idCourse;

    @Column(name = "FK_id_teacher", nullable = false)
    private Integer idTeacher;

    @Column(name = "FK_id_period", nullable = false)
    private Integer idPeriod;

    @Column(name = "FK_id_subject", nullable = false)
    private Integer idSubject;

    @Column(name = "FK_id_evaluative", nullable = false)
    private Integer idEvaluative;

    @Column(name = "FK_id_evaluation_type", nullable = false)
    private Integer idEvaluationType;

    @Column(name = "grade_value", nullable = false, precision = 5, scale = 2)
    private BigDecimal gradeValue;

    /** REGISTERED (por defecto), MODIFIED, ANNULLED */
    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "registration_date", nullable = false)
    private LocalDate registrationDate;
}
