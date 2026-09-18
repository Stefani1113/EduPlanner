package com.eduplanner.ed_lib_common.dto;

import java.time.LocalDateTime;

import com.eduplanner.ed_lib_common.entity.InstitutionConfiguration;
import lombok.Builder;

/**
 * Respuesta de configuración institucional expuesta al frontend.
 * NOTA (RF 10.7): generalBackground e institutionalWhite se exponen como
 * "readonly" (valores de sistema) y NO deben ser editables desde el panel
 * de administración. El fondo general lo controla el modo Día/Noche.
 */
@Builder
public record ConfigurationResponse(

        String shortName,
        String longName,
        String description,

        String logoUrl,

        // Colores editables por el administrador (RF 10 / RF 10.1)
        String primaryColor,
        String secondaryColor,
        String accentColor,
        String cardBackground,
        String secondaryBackground,

        // Valores de sistema, solo lectura (RF 10.7)
        String generalBackground,
        String institutionalWhite,

        LocalDateTime updatedAt
) {
    public static ConfigurationResponse fromEntity(InstitutionConfiguration entity) {
        return ConfigurationResponse.builder()
                .shortName(entity.getShortName())
                .longName(entity.getLongName())
                .description(entity.getDescription())
                .logoUrl(entity.getLogoUrl())
                .primaryColor(entity.getPrimaryColor())
                .secondaryColor(entity.getSecondaryColor())
                .accentColor(entity.getAccentColor())
                .cardBackground(entity.getCardBackground())
                .secondaryBackground(entity.getSecondaryBackground())
                .generalBackground(entity.getGeneralBackground())
                .institutionalWhite(entity.getInstitutionalWhite())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
