package eduPlanner.ed_ms_configuracion_institucional.service;

import com.eduplanner.ed_lib_common.dto.ColorsUpdateRequest;
import com.eduplanner.ed_lib_common.dto.ConfigurationResponse;
import com.eduplanner.ed_lib_common.dto.InstitutionInfoUpdateRequest;
import com.eduplanner.ed_lib_common.entity.InstitutionConfiguration;
import eduPlanner.ed_ms_configuracion_institucional.exception.ResourceNotFoundException;
import eduPlanner.ed_ms_configuracion_institucional.repository.InstitutionConfigurationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class InstitutionConfigurationService {

    private static final int SINGLETON_ID = 1;

    private final InstitutionConfigurationRepository configurationRepository;
    private final CloudinaryService cloudinaryService;

    @Value("${institution.default-colors.primary}")
    private String defaultPrimary;

    @Value("${institution.default-colors.secondary}")
    private String defaultSecondary;

    @Value("${institution.default-colors.accent}")
    private String defaultAccent;

    @Value("${institution.default-colors.card-background}")
    private String defaultCardBackground;

    @Value("${institution.default-colors.secondary-background}")
    private String defaultSecondaryBackground;

    /**
     * RF 10.4: lee la configuración institucional al iniciar sesión.
     * Si aún no existe (primer arranque), crea una fila con los valores
     * por defecto para que el sistema nunca quede sin tema.
     */
    @Transactional(readOnly = true)
    public ConfigurationResponse getConfiguration() {
        InstitutionConfiguration configuration = getOrCreateDefault();
        return ConfigurationResponse.fromEntity(configuration);
    }

    /**
     * RF 10.1: valida (vía Bean Validation en el controller) que los 5
     * colores estén presentes antes de guardar. Aquí solo persistimos.
     */
    @Transactional
    public ConfigurationResponse updateColors(ColorsUpdateRequest request) {
        InstitutionConfiguration configuration = getOrCreateDefault();

        configuration.setPrimaryColor(request.primaryColor());
        configuration.setSecondaryColor(request.secondaryColor());
        configuration.setAccentColor(request.accentColor());
        configuration.setCardBackground(request.cardBackground());
        configuration.setSecondaryBackground(request.secondaryBackground());

        return ConfigurationResponse.fromEntity(configurationRepository.save(configuration));
    }

    @Transactional
    public ConfigurationResponse updateInfo(InstitutionInfoUpdateRequest request) {
        InstitutionConfiguration configuration = getOrCreateDefault();

        configuration.setShortName(request.shortName());
        configuration.setLongName(request.longName());
        configuration.setDescription(request.description());

        return ConfigurationResponse.fromEntity(configurationRepository.save(configuration));
    }

    /**
     * RF 10.2 / RF 10.2.2: sube el logo a Cloudinary (validación de
     * formato/tamaño ocurre dentro de CloudinaryService) y reemplaza
     * el logo anterior si existía.
     */
    @Transactional
    public ConfigurationResponse updateLogo(MultipartFile file) {
        InstitutionConfiguration configuration = getOrCreateDefault();

        String previousPublicId = configuration.getLogoPublicId();

        CloudinaryService.UploadResult uploadResult = cloudinaryService.uploadLogo(file);

        configuration.setLogoUrl(uploadResult.url());
        configuration.setLogoPublicId(uploadResult.publicId());

        InstitutionConfiguration saved = configurationRepository.save(configuration);

        if (previousPublicId != null && !previousPublicId.isBlank()) {
            cloudinaryService.delete(previousPublicId);
        }

        return ConfigurationResponse.fromEntity(saved);
    }

    /**
     * RF 10.8: restablece los 5 colores editables a los valores por
     * defecto de EduPlanner. No modifica el logo ni la información
     * institucional (nombre, descripción).
     */
    @Transactional
    public ConfigurationResponse resetColorsToDefault() {
        InstitutionConfiguration configuration = getOrCreateDefault();

        configuration.setPrimaryColor(defaultPrimary);
        configuration.setSecondaryColor(defaultSecondary);
        configuration.setAccentColor(defaultAccent);
        configuration.setCardBackground(defaultCardBackground);
        configuration.setSecondaryBackground(defaultSecondaryBackground);

        return ConfigurationResponse.fromEntity(configurationRepository.save(configuration));
    }

    private InstitutionConfiguration getOrCreateDefault() {
        return configurationRepository.findById(SINGLETON_ID)
                .orElseGet(this::createDefaultConfiguration);
    }

    private InstitutionConfiguration createDefaultConfiguration() {
        InstitutionConfiguration configuration = InstitutionConfiguration.builder()
                .idConfiguration(SINGLETON_ID)
                .shortName("EduPlanner")
                .longName("EduPlanner")
                .description("")
                .primaryColor(defaultPrimary)
                .secondaryColor(defaultSecondary)
                .accentColor(defaultAccent)
                .cardBackground(defaultCardBackground)
                .secondaryBackground(defaultSecondaryBackground)
                // Valores de sistema (RF 10.7), no editables por el admin
                .generalBackground("#111111")
                .institutionalWhite("#FFFFFF")
                .build();

        return configurationRepository.save(configuration);
    }

    protected InstitutionConfiguration requireConfiguration() {
        return configurationRepository.findById(SINGLETON_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Configuración institucional no encontrada"));
    }
}
