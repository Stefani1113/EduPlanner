package eduPlanner.ed_ms_configuracion_institucional.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.eduplanner.ed_lib_common.dto.ColorsUpdateRequest;
import com.eduplanner.ed_lib_common.dto.ConfigurationResponse;
import com.eduplanner.ed_lib_common.dto.InstitutionInfoUpdateRequest;
import com.eduplanner.ed_lib_common.entity.InstitutionConfiguration;
import eduPlanner.ed_ms_configuracion_institucional.exception.BusinessException;
import eduPlanner.ed_ms_configuracion_institucional.repository.InstitutionConfigurationRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Administra la fila única de configuración institucional (id fijo = 1).
 *
 * RF 10 / RF 10.1:
 * nombre, descripción, logo y colores editables.
 *
 * RF 10.7:
 * generalBackground e institutionalWhite son valores de sistema
 * y no se exponen como editables desde el panel de administración.
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class InstitutionConfigurationService {

    private static final Integer CONFIGURATION_ID = 1;
    private static final String LOGO_PUBLIC_ID = "institution_logo";

    private final InstitutionConfigurationRepository repository;
    private final Cloudinary cloudinary;

    @Value("${institution.default-colors.primary:#0FA000}")
    private String defaultPrimaryColor;

    @Value("${institution.default-colors.secondary:#45E000}")
    private String defaultSecondaryColor;

    @Value("${institution.default-colors.accent:#C8E8CF}")
    private String defaultAccentColor;

    @Value("${institution.default-colors.card-background:#171717}")
    private String defaultCardBackground;

    @Value("${institution.default-colors.secondary-background:#202020}")
    private String defaultSecondaryBackground;

    @Value("${institution.system-colors.general-background:#111111}")
    private String systemGeneralBackground;

    @Value("${institution.system-colors.institutional-white:#FFFFFF}")
    private String systemInstitutionalWhite;

    @Value("${institution.logo.max-size-bytes:2097152}")
    private long logoMaxSizeBytes;

    @Value("${institution.logo.allowed-content-types:image/png,image/jpeg,image/jpg,image/svg+xml}")
    private String logoAllowedContentTypes;

    @Value("${cloudinary.folder:eduplanner/institution}")
    private String cloudinaryFolder;

    // ─────────────────────────────────────────────────────────────────────
    // LECTURA
    // ─────────────────────────────────────────────────────────────────────

    public ConfigurationResponse getConfiguration() {
        return toResponse(getOrCreateDefault());
    }

    /**
     * Devuelve la fila única de configuración.
     *
     * Si no existe, la crea con los valores definidos en application.yaml.
     */
    @Transactional
    InstitutionConfiguration getOrCreateDefault() {
        return repository.findById(CONFIGURATION_ID)
                .orElseGet(this::createDefaultConfiguration);
    }

    /**
     * Crea la configuración institucional inicial.
     */
    private InstitutionConfiguration createDefaultConfiguration() {

        log.info(
                "No existe configuración institucional previa; "
                        + "creando fila por defecto (id={})",
                CONFIGURATION_ID
        );

        InstitutionConfiguration entity = InstitutionConfiguration.builder()
                .idConfiguration(CONFIGURATION_ID)
                .shortName("Mi Institución")
                .longName("Mi Institución Educativa")
                .description(null)

                // Colores editables
                .primaryColor(defaultPrimaryColor)
                .secondaryColor(defaultSecondaryColor)
                .accentColor(defaultAccentColor)
                .cardBackground(defaultCardBackground)
                .secondaryBackground(defaultSecondaryBackground)

                // Valores del sistema
                .generalBackground(systemGeneralBackground)
                .institutionalWhite(systemInstitutionalWhite)

                .build();

        return repository.save(entity);
    }

    // ─────────────────────────────────────────────────────────────────────
    // ESCRITURA - INFORMACIÓN INSTITUCIONAL
    // ─────────────────────────────────────────────────────────────────────

    @Transactional
    public ConfigurationResponse updateInfo(
            InstitutionInfoUpdateRequest request
    ) {

        InstitutionConfiguration entity = getOrCreateDefault();

        entity.setShortName(request.shortName());
        entity.setLongName(request.longName());
        entity.setDescription(request.description());

        return toResponse(repository.save(entity));
    }

    // ─────────────────────────────────────────────────────────────────────
    // ESCRITURA - COLORES
    // ─────────────────────────────────────────────────────────────────────

    @Transactional
    public ConfigurationResponse updateColors(
            ColorsUpdateRequest request
    ) {

        InstitutionConfiguration entity = getOrCreateDefault();

        entity.setPrimaryColor(request.primaryColor());
        entity.setSecondaryColor(request.secondaryColor());
        entity.setAccentColor(request.accentColor());
        entity.setCardBackground(request.cardBackground());
        entity.setSecondaryBackground(request.secondaryBackground());

        return toResponse(repository.save(entity));
    }

    /**
     * Restablece únicamente los colores editables
     * a los valores definidos en application.yaml.
     */
    @Transactional
    public ConfigurationResponse resetColorsToDefault() {

        InstitutionConfiguration entity = getOrCreateDefault();

        entity.setPrimaryColor(defaultPrimaryColor);
        entity.setSecondaryColor(defaultSecondaryColor);
        entity.setAccentColor(defaultAccentColor);
        entity.setCardBackground(defaultCardBackground);
        entity.setSecondaryBackground(defaultSecondaryBackground);

        return toResponse(repository.save(entity));
    }

    // ─────────────────────────────────────────────────────────────────────
    // LOGO
    // ─────────────────────────────────────────────────────────────────────

    @Transactional
    public ConfigurationResponse uploadLogo(
            MultipartFile file
    ) {

        validateLogoFile(file);

        InstitutionConfiguration entity = getOrCreateDefault();

        try {

            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", cloudinaryFolder,
                            "public_id", LOGO_PUBLIC_ID,
                            "overwrite", true,
                            "resource_type", "image"
                    )
            );

            entity.setLogoUrl(
                    (String) uploadResult.get("secure_url")
            );

            entity.setLogoPublicId(
                    (String) uploadResult.get("public_id")
            );

            return toResponse(repository.save(entity));

        } catch (IOException e) {

            log.error(
                    "Error subiendo el logo institucional a Cloudinary: {}",
                    e.getMessage(),
                    e
            );

            throw new BusinessException(
                    "No se pudo subir el logo institucional. Intenta nuevamente.",
                    e
            );
        }
    }

    @Transactional
    public ConfigurationResponse removeLogo() {

        InstitutionConfiguration entity = getOrCreateDefault();

        if (entity.getLogoPublicId() != null) {

            try {

                cloudinary.uploader().destroy(
                        entity.getLogoPublicId(),
                        ObjectUtils.emptyMap()
                );

            } catch (IOException e) {

                log.warn(
                        "No se pudo eliminar el logo anterior en Cloudinary ({}): {}",
                        entity.getLogoPublicId(),
                        e.getMessage()
                );
            }
        }

        entity.setLogoUrl(null);
        entity.setLogoPublicId(null);

        return toResponse(repository.save(entity));
    }

    // ─────────────────────────────────────────────────────────────────────
    // VALIDACIÓN DEL LOGO
    // ─────────────────────────────────────────────────────────────────────

    private void validateLogoFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {

            throw new BusinessException(
                    "El archivo del logo está vacío"
            );
        }

        String contentType = file.getContentType();

        List<String> allowed = List.of(
                logoAllowedContentTypes.split(",")
        );

        if (
                contentType == null
                        || allowed.stream()
                        .noneMatch(contentType::equalsIgnoreCase)
        ) {

            throw new BusinessException(
                    "El logo debe ser una imagen en formato PNG, JPG o SVG"
            );
        }

        if (file.getSize() > logoMaxSizeBytes) {

            throw new BusinessException(
                    "El logo no debe superar los "
                            + (logoMaxSizeBytes / (1024 * 1024))
                            + "MB"
            );
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // MAPEADOR ENTITY -> DTO
    // ─────────────────────────────────────────────────────────────────────

    private ConfigurationResponse toResponse(
            InstitutionConfiguration entity
    ) {

        return ConfigurationResponse.builder()

                .shortName(entity.getShortName())
                .longName(entity.getLongName())
                .description(entity.getDescription())

                .logoUrl(entity.getLogoUrl())

                // Colores editables
                .primaryColor(entity.getPrimaryColor())
                .secondaryColor(entity.getSecondaryColor())
                .accentColor(entity.getAccentColor())
                .cardBackground(entity.getCardBackground())
                .secondaryBackground(entity.getSecondaryBackground())

                // Valores de sistema
                .generalBackground(entity.getGeneralBackground())
                .institutionalWhite(entity.getInstitutionalWhite())

                .updatedAt(entity.getUpdatedAt())

                .build();
    }
}
