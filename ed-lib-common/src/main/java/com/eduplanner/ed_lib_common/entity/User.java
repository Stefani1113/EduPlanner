package com.eduplanner.ed_lib_common.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import javax.management.relation.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data

/**
 * Tabla User 
 * User
 */
@Table(name = "User")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_user")
    private Integer idUser;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 150)
    private String surnames;

    @Column(name = "document_type", nullable = false, length = 20)
    private String documentType;

    @Column(nullable = false, unique = true, length = 50)
    private String document;

    @Column(name = "document_issue_place", length = 100)
    private String documentIssuePlace;

    @Column(nullable = false)
    private LocalDate birthdate;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(nullable = false)
    private Boolean status = true;

    @Column(name = "photo_url", length = 255)
    private String photoUrl;

    @Column(name = "professional_degrees", nullable = false, columnDefinition = "TEXT")
    private String professionalDegrees;

    @Column(name = "qualifications_desc", columnDefinition = "TEXT")
    private String qualificationsDesc;

    @Column(nullable = false, length = 20)
    private String gender;

    @Column(length = 255)
    private String address;

    @Column(name = "blood_type", nullable = false, length = 5)
    private String bloodType;

    @Column(columnDefinition = "TEXT")
    private String disabilities;

    @Column(nullable = false)
    private Integer stratum;

    @Column(name = "population_type", length = 100)
    private String populationType;

    @Column(name = "health_regime", length = 50)
    private String healthRegime;

    @Column(length = 100)
    private String eps;

    @Column(nullable = false, length = 100)
    private String position;

    @Column(name = "creation_date", nullable = false)
    private LocalDateTime creationDate;

    @Column(name = "update_date", nullable = false)
    private LocalDateTime updateDate;

    @Column(name = "last_access")
    private LocalDateTime lastAccess;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_role", nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_import")
    private Import importEntity;

    @Column(name = "id_institution", nullable = false)
    private Integer idInstitution;

    /**
     * Asignación de fecha de creación automatica
     */
    @PrePersist
    public void prePersist() {
    this.creationDate = LocalDateTime.now();
    this.updateDate = LocalDateTime.now();
    }

    /**
     * Asignación de fecha de actualización automática
     */
    @PreUpdate
    public void preUpdate() {
    this.updateDate = LocalDateTime.now();
    }

}
