package com.eduplanner.ed_lib_common.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "institution_configuration")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstitutionConfiguration {

    @Id
    @Column(name = "id_configuration")
    @Builder.Default
    private Integer idConfiguration = 1;

    @Column(name = "short_name", length = 100, nullable = false)
    private String shortName;

    @Column(name = "long_name", length = 200, nullable = false)
    private String longName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "logo_public_id", length = 255)
    private String logoPublicId;

    // Los 5 colores configurables por el administrador (RF 10 / RF 10.1)
    @Column(name = "primary_color", length = 7, nullable = false)
    private String primaryColor;

    @Column(name = "secondary_color", length = 7, nullable = false)
    private String secondaryColor;

    @Column(name = "accent_color", length = 7, nullable = false)
    private String accentColor;

    @Column(name = "card_background", length = 7, nullable = false)
    private String cardBackground;

    @Column(name = "secondary_background", length = 7, nullable = false)
    private String secondaryBackground;

    // Valores de sistema, NO editables por el administrador (RF 10.7).
    // El fondo general lo controla el modo Día/Noche del sistema.
    @Column(name = "general_background", length = 7, nullable = false)
    private String generalBackground;

    @Column(name = "institutional_white", length = 7, nullable = false)
    private String institutionalWhite;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}